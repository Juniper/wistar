import time
import logging
import pexpect
import os
import openstackUtils
from wistar import configuration

from WistarException import WistarException

# simple utility lib to use virsh console to set up a device before 
# networking is available
logger = logging.getLogger(__name__)


def get_console(name):
    """
    Spawn some program to give us a console
    for KVM use virsh
    for VirtualBox, Vagrant use socat
    for OpenStack use websocket_console_client
    :param name: domain or instance name
    :return: pexpect child process
    """
    if configuration.deployment_backend == "openstack":
        if openstackUtils.connect_to_openstack():
            logger.debug("Getting openstack console!")
            ws_url = openstackUtils.get_nova_serial_console(name)
            if ws_url is None:
                raise WistarException("serial console not found for %s" % name)

            path = os.path.abspath(os.path.dirname(__file__))
            ws = os.path.join(path, "../../webConsole/bin/websocket_console_client.py")
            web_socket_path = os.path.abspath(ws)
            # logger.debug("running python %s  %s" % (web_socket_path, ws_url))
            return pexpect.spawn("python %s %s" % (web_socket_path, ws_url), timeout=60)

    elif configuration.deployment_backend == "virtualbox":
        return pexpect.spawn("socat /tmp/" + name + ".pipe - ", timeout=60)
    # default to assuming KVM
    else:
        return pexpect.spawn("virsh console " + name, timeout=60)


# is this Junos device at login yet?
# open the console and see if there a prompt
# if we don't see one in 3 seconds, return False!
def is_junos_device_at_prompt(dom):
    try:
        child = get_console(dom)
        try:
            child.send("\r\r\r")
            index = child.expect(
                    ["error: failed to get domain", "login:", "[^\s]%", "[^\s]>", "[^\s]#", "[^\s]@.*:~ #"],
                    timeout=3)
            if index == 0:
                logger.info("Domain is not configured!")
                return False
            elif index == 1:
                # logger.debug("domain is at the login prompt")
                return True
            # no timeout indicates we are at some sort of prompt!
            return True
        except pexpect.TIMEOUT:
            logger.info("console is available, but not at login prompt -")
            logger.debug(str(child))
            return False
    except Exception as e:
        # logger.debug(str(e))
        logger.info("console does not appear to be available")
        # logger.debug(str(child))
        return False


# if the device is already logged in, let's try to recover and get
# back to a login prompt before continuing
def recover_junos_prompt(dom):
    logger.debug("Getting boot up state of: " + str(dom))
    try:
        child = get_console(dom)
        try:
            child.send("\r")
            child.send("\r")
            index = child.expect(["error: failed to get domain", "[^\s]%", "[^\s]>", "[^\s]#", "login:"])
            logger.debug("Found prompt: " + child.before)
            if index == 0:
                logger.debug("Domain is not configured!")
                return False
            elif index == 1:
                logger.debug("at initial root@% prompt")
                child.send("exit\r")
                # super tricky bug here. child would exit before the command had actually been sent
                time.sleep(.5)
                child.send("\r")
                # we should now be back at login prompt!
                child.expect("login:")
                return True
            elif index == 2:
                logger.debug("at normal prompt")
                # exit cli
                child.send("exit\r")
                time.sleep(.5)
                child.expect("[^\s]%")
                # exit sh
                child.send("exit\r")
                time.sleep(.5)
                # we should now be back at login prompt!
                child.expect("login:")
                return True
            elif index == 3:
                logger.debug("at configure prompt")
                child.send("top\r")
                time.sleep(.5)
                child.send("rollback 0\r")
                time.sleep(1)
                # exit config
                child.send("exit\r")
                time.sleep(.5)
                # exit cli
                child.send("exit\r")
                time.sleep(.5)
                # exit sh
                child.send("exit\r")
                time.sleep(.5)
                return True
            # no timeout indicates we are at some sort of prompt!
            return True
        except pexpect.TIMEOUT:
            logger.debug("console is available, but not at login prompt")
            # logger.debug(str(child))
            return False
    except Exception as e:
        logger.debug(str(e))
        logger.debug("console does not appear to be available")
        # logger.debug(str(child))
        return False


def is_linux_device_at_prompt(dom):
    logger.debug("Getting boot up state of: " + str(dom))
    try:
        child = get_console(dom)
        logger.debug("got child")
        try:
            child.send("\r")
            child.send("\r")
            logger.debug("sent enter enter")
            index = child.expect(["error: failed to get domain", "[^\s]%", "[^\s]#", ".*login:",
                                 "error: operation failed", '.*assword:'])
            logger.debug("Found prompt: " + child.before)
            if index == 0:
                logger.debug("Domain is not configured!")
                return False
            elif index == 1:
                logger.debug("User is logged in, logging her out")
                child.sendline("exit")
                child.expect(".*login:")
                return True
            elif index == 2:
                logger.debug("Root is logged in, logging her out")
                child.sendline("exit")
                child.expect(".*login:")
                return True
            elif index == 3:
                logger.debug("At login prompt")
                return True
            elif index == 4:
                logger.debug("Could not get console")
                return False
            elif index == 5:
                child.send("\r")
                child.expect(".*login:")
                return True
        except pexpect.TIMEOUT:
            logger.debug("console is available, but not at login prompt")
            # logger.debug(str(child))
            return False
    except Exception as e:
        logger.debug(str(e))
        logger.debug("console does not appear to be available")
        return False


def preconfig_firefly(dom, user, pw, mgmt_interface="em0"):
    try:
        if recover_junos_prompt(dom):
            child = get_console(dom)
            logger.debug("Logging in as user: %s" % user)
            child.sendline(user)
            child.expect("assword:")
            logger.debug("Sending password")
            child.send(pw + "\r")
            child.expect("root@.*")
            logger.debug("Sending cli")
            child.send("cli\r")
            child.expect("root.*>")
            logger.debug("Sending configure private")
            child.send("configure private\r")
            ret = child.expect(["root.*#", "error.*"])
            if ret == 1:
                raise WistarException("Could not obtain private lock on db")
            logger.debug("Adding " + str(mgmt_interface) + " to trust zone")
            long_command = "set security zones security-zone trust interfaces " + mgmt_interface
            long_command += " host-inbound-traffic system-services all\r"
            child.send(long_command)
            logger.debug("Committing changes")
            child.send("commit and-quit\r")
            time.sleep(3)
            child.send("quit\r")
            time.sleep(1)
            child.send("exit\r")
            time.sleep(1)
            child.send("exit\r")
            time.sleep(1)
            child.send("exit\r")
            logger.debug("all-done")
            return True
        else: 
            logger.debug("console does not appear to be available")
            return False
    except pexpect.TIMEOUT as t:
        logger.debug("Error adding interface to trust zone")
        return False
    except:
        logger.debug("console does not appear to be available")
        return False


def preconfig_linux_domain(dom, hostname, user, pw, ip, mgmt_interface="eth0"):
    logger.debug("in preconfig_linux_domain")
    child = get_console(dom)
    # child.logfile=sys.stdout
    prompt = "%s.*#" % user
    sudo = ""
    if user != "root":
        prompt = "%s.*>" % user
        sudo = "sudo "
    try:
        child.send("\r")
        child.send("\r")
        child.send("\r")
        index = child.expect(["[^\s]\$", "[^\s]#", ".*login:", ".*assword:"])
        logger.debug("Found prompt: " + child.before)
        if index == 0 or index == 1:
            # someone is already logged in on the console
            logger.debug("Logging out existing user session")
            child.sendline("exit")
        elif index == 3:
            logger.debug("At password prompt")
            child.send("\r")
            time.sleep(1) 
        logger.debug("looking for login prompt")
        child.expect(".*login:")
        logger.debug("Logging in as %s" % user)
        child.sendline(user)
        child.expect("assword:")
        logger.debug("sending pw")
        child.sendline(pw)
        index = child.expect([prompt, "Login incorrect"])
        if index == 1:
            logger.debug("Incorrect login information")
            raise WistarException("Incorrect Login Information")

        logger.debug("flushing ip information")
        child.sendline("%sip addr flush dev %s" % (sudo, mgmt_interface))
        child.expect(prompt)
        logger.debug("sending ip information")
        child.sendline("%sip addr add %s/24 dev %s" % (sudo, ip, mgmt_interface))
        child.expect(prompt)
        logger.debug("sending route information")
        child.sendline("%sip route add default via %s" % (sudo, configuration.management_gateway))
        child.expect(prompt)
        logger.debug("sending link up")
        child.sendline("%sip link set %s up" % (sudo, mgmt_interface))
        child.expect(prompt)
        logger.debug("sending hostnamectl")
        child.sendline("%shostnamectl set-hostname %s" % (sudo, hostname))
        child.expect(prompt)
        logger.debug("sending exit")
        child.sendline("exit")
        logger.debug("looking for login prompt")
        child.expect(".*login:")
        
        return True
    
    except pexpect.TIMEOUT:
        logger.debug("Error configuring Linux domain")
        logger.debug(str(child))
        return False
    
    except pexpect.EOF as e:
        logger.debug(repr(e))
        logger.debug("Failed to preconfig linux domain!")
        raise WistarException("Console process unexpectedly quit! Is the console already open?")


def preconfig_junos_domain(dom, user, pw, mgmt_ip, mgmt_interface="em0"):
    try:
        if recover_junos_prompt(dom):
            needs_pw = False

            child = get_console(dom)
            logger.debug("Got console, Logging in as root")
            child.send("\r")
            child.send("\r")
            child.expect(".*ogin:")
            logger.debug("sending user: %s" % user)
            child.sendline(user)

            ret = child.expect(["assword:", "[^\s]%", "root@.*:~ #"])
            if ret == 0:
                logger.debug("Sending password")
                child.sendline(pw)
                child.expect("root@.*")
                logger.debug("Sending cli")
                child.sendline("cli")
            elif ret == 1 or ret == 2:
                child.sendline("cli")
                # there is no password or hostname set yet
                needs_pw = True

            child.send("\r")
            child.expect("root.*>")
            logger.debug("Sending configure private")
            child.sendline("configure private")
            ret = child.expect(["root.*#", "error.*"])
            if ret == 1:
                raise WistarException("Could not obtain private lock on db")

            if needs_pw:
                logger.debug("Setting root authentication")
                child.sendline("set system root-authentication plain-text-password")
                child.expect("assword:")
                logger.debug("sending first password")
                child.sendline(pw)
                index = child.expect(["assword:", "error:"])
                if index == 1:
                    raise WistarException("Password Complexity Error")

                child.sendline(pw)

            logger.debug("Setting host-name to " + str(dom))
            child.sendline("set system host-name " + str(dom))
            logger.debug("Turning on netconf and ssh")
            child.sendline("set system services netconf ssh")
            child.sendline("set system services ssh")
            child.sendline("delete interface " + mgmt_interface)
            time.sleep(.5)
            logger.debug("Configuring " + mgmt_interface + " default to /24 for now!!!")
            child.sendline("set interface " + mgmt_interface + " unit 0 family inet address " + mgmt_ip + "/24")
            logger.debug("setting default route")
            child.sendline("set routing-options static route 0.0.0.0/0 next-hop %s" % configuration.management_gateway)
            time.sleep(.5)
            logger.debug("Committing changes")
            child.sendline("commit and-quit")
            ret = child.expect(["root.*>", "error:", "root.*# $"], timeout=300)
            if ret == 1:
                logger.debug(str(child))
                raise WistarException("Error committing configuration")
            elif ret == 2:
                logger.debug(str(child))
                logger.debug("Still at configure prompt??")
                # attempt to recover for another try by user later
                child.sendline("rollback 0")
                time.sleep(1)
                child.sendline("quit")
                time.sleep(1)
                child.sendline("quit")
                time.sleep(1)
                child.sendline("exit")
                raise WistarException("Error committing configuration")

            child.sendline("exit")
            # time.sleep(1)
            child.sendline("exit")
            # time.sleep(1)
            child.expect("login:")
            logger.debug("all-done")

            return True
        else:
            logger.debug("console does not appear to be available")
            return False

    except pexpect.TIMEOUT:
        logger.debug("Timeout configuring Junos Domain")
        logger.debug(str(child))
        return False
   
    except pexpect.EOF as e:
        logger.debug(repr(e))
        logger.debug("Failed to preconfig junos domain!")
        raise WistarException("Console process unexpectedly quit! Is the console already open?")

