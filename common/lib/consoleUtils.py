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
            ws_url = openstackUtils.get_nova_serial_console(name)
            path = os.path.abspath(os.path.dirname(__file__))
            ws = os.path.join(path, "../../webConsole/bin/websocket_console_client.py")
            web_socket_path = os.path.abspath(ws)
            print "running python %s  %s" % (web_socket_path, ws_url)
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
            index = child.expect(["error: failed to get domain", "login:"], timeout=3)
            if index == 0:
                print "Domain is not configured!"
                return False
            elif index == 1:
                print "domain is at the login prompt"
                return True

            # no timeout indicates we are at some sort of prompt!
            return True
        except pexpect.TIMEOUT:
            print "console is available, but not at login prompt"
            # print str(child)
            return False
    except Exception as e:
        # print str(e)
        print "console does not appear to be available"
        # print str(child)
        return False


# if the device is already logged in, let's try to recover and get
# back to a login prompt before continuing
def recover_junos_prompt(dom):
    print "Getting boot up state of: " + str(dom)
    try:
        child = get_console(dom)
        try:
            child.send("\r")
            child.send("\r")
            index = child.expect(["error: failed to get domain", "[^\s]%", "[^\s]>", "[^\s]#", "login:"])
            print "Found prompt: " + child.before
            if index == 0:
                print "Domain is not configured!"
                return False
            elif index == 1:
                print "at initial root@% prompt"
                child.send("exit\r")
                # super tricky bug here. child would exit before the command had actually been sent
                time.sleep(.5)
                child.send("\r")
                # we should now be back at login prompt!
                child.expect("login:")
                return True
            elif index == 2:
                print "at normal prompt"
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
                print "at configure prompt"
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
            print "console is available, but not at login prompt"
            # print str(child)
            return False
    except Exception as e:
        print str(e)
        print "console does not appear to be available"
        # print str(child)
        return False


def is_linux_device_at_prompt(dom):
    print "Getting boot up state of: " + str(dom)
    try:
        child = get_console(dom)
        print "got child"
        try:
            child.send("\r")
            child.send("\r")
            print "sent enter enter"
            index = child.expect(["error: failed to get domain", "[^\s]%", "[^\s]#", ".*login:",
                                 "error: operation failed", '.*assword:'])
            print "Found prompt: " + child.before
            if index == 0:
                print "Domain is not configured!"
                return False
            elif index == 1:
                print "User is logged in, logging her out"
                child.sendline("exit")
                child.expect(".*login:")
                return True
            elif index == 2:
                print "Root is logged in, logging her out"
                child.sendline("exit")
                child.expect(".*login:")
                return True
            elif index == 3:
                print "At login prompt"
                return True
            elif index == 4:
                print "Could not get console"
                return False
            elif index == 5:
                child.send("\r")
                child.expect(".*login:")
                return True
        except pexpect.TIMEOUT:
            print "console is available, but not at login prompt"
            # print str(child)
            return False
    except Exception as e:
        print str(e)
        print "console does not appear to be available"
        return False


def preconfig_firefly(dom, pw, mgmtInterface="em0"):
    try:
        if recover_junos_prompt(dom):
            child = get_console(dom)
            print "Logging in as root"
            child.send("root\r")
            child.expect("assword:")
            print "Sending password"
            child.send(pw + "\r")
            child.expect("root@.*")
            print "Sending cli"
            child.send("cli\r")
            child.expect("root.*>")
            print "Sending configure private"
            child.send("configure private\r")
            ret = child.expect(["root.*#", "error.*"])
            if ret == 1:
                raise WistarException("Could not obtain private lock on db")
            print "Adding " + str(mgmtInterface) + " to trust zone"
            long_command = "set security zones security-zone trust interfaces " + mgmtInterface
            long_command += " host-inbound-traffic system-services all\r"
            child.send(long_command)
            print "Committing changes"
            child.send("commit and-quit\r")
            time.sleep(3)
            child.send("quit\r")
            time.sleep(1)
            child.send("exit\r")
            time.sleep(1)
            child.send("exit\r")
            time.sleep(1)
            child.send("exit\r")
            print "all-done"
            return True
        else: 
            print "console does not appear to be available"
            return False
    except pexpect.TIMEOUT as t:
        print "Error adding interface to trust zone"
        return False
    except:
        print "console does not appear to be available"
        return False


def preconfig_linux_domain(dom, hostname, pw, ip, mgmtInterface="eth0"):
    print "in preconfig_linux_domain"
    child = get_console(dom)
    # child.logfile=sys.stdout
    try:
        child.send("\r")
        child.send("\r")
        child.send("\r")
        index = child.expect(["[^\s]\$", "[^\s]#", ".*login:", ".*assword:"])
        print "Found prompt: " + child.before
        if index == 0 or index == 1:
            # someone is already logged in on the console
            print "Logging out existing user session"
            child.sendline("exit")
        elif index == 3:
            print "At password prompt"
            child.send("\r")
            time.sleep(1) 
        print "looking for login prompt"
        child.expect(".*login:")
        print "Logging in as root"
        child.sendline("root")
        child.expect("assword:")
        print "sending pw"
        child.sendline(pw)
        index = child.expect(["root.*#", "Login incorrect"])
        if index == 1:
            print "Incorrect login information"
            raise WistarException("Incorrect Login Information")

        print "flushing ip information"
        child.sendline("ip addr flush dev " + mgmtInterface)
        child.expect("root.*#")
        print "sending ip information"
        child.sendline("ip addr add " + ip + "/24 dev " + mgmtInterface)
        child.expect("root.*#")
        print "sending link up"
        child.sendline("ip link set " + mgmtInterface + " up")
        child.expect("root.*#")
        print "sending hostnamectl"
        child.sendline("hostnamectl set-hostname " + hostname)
        child.expect("root.*#")
        print "sending exit"
        child.sendline("exit")
        print "looking for login prompt"
        child.expect(".*login:")
        
        return True
    
    except pexpect.TIMEOUT:
        print "Error configuring Linux domain"
        print str(child)
        return False
    
    except pexpect.EOF as e:
        print repr(e)
        print "Failed to preconfig linux domain!"
        raise WistarException("Console process unexpectedly quit! Is the console already open?")


def preconfig_junos_domain(dom, pw, em0Ip, mgmtInterface="em0"):
    try:
        if recover_junos_prompt(dom):
            needs_pw = False

            child = get_console(dom)
            print "Logging in as root"
            child.send("\r")
            child.sendline("root")

            ret = child.expect(["assword:", "[^\s]%"])
            if ret == 0:
                print "Sending password"
                child.sendline(pw)
                child.expect("root@.*")
                print "Sending cli"
                child.sendline("cli")
            elif ret == 1:
                child.sendline("cli")
                # there is no password or hostname set yet
                needs_pw = True

            child.send("\r")
            child.expect("root.*>")
            print "Sending configure private"
            child.sendline("configure private")
            ret = child.expect(["root.*#", "error.*"])
            if ret == 1:
                raise WistarException("Could not obtain private lock on db")

            if needs_pw:
                print "Setting root authentication"
                child.sendline("set system root-authentication plain-text-password")
                child.expect("assword:")
                print "sending first password"
                child.sendline(pw)
                index = child.expect(["assword:", "error:"])
                if index == 1:
                    raise WistarException("Password Complexity Error")

                child.sendline(pw)

            print "Setting host-name to " + str(dom)
            child.sendline("set system host-name " + str(dom))
            print "Turning on netconf and ssh"
            child.sendline("set system services netconf ssh")
            child.sendline("set system services ssh")
            child.sendline("delete interface " + mgmtInterface)
            time.sleep(.5)
            print "Configuring " + mgmtInterface + " default to /24 for now!!!"
            child.sendline("set interface " + mgmtInterface + " unit 0 family inet address " + em0Ip + "/24")

            time.sleep(.5)
            print "Committing changes"
            child.sendline("commit and-quit")
            ret = child.expect(["root.*>", "error:", "root.*# $"], timeout=300)
            if ret == 1:
                print str(child)
                raise WistarException("Error committing configuration")
            elif ret == 2:
                print str(child)
                print "Still at configure prompt??"
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
            print "all-done"

            return True
        else:
            print "console does not appear to be available"
            return False

    except pexpect.TIMEOUT:
        print "Timeout configuring Junos Domain"
        print str(child)
        return False
   
    except pexpect.EOF as e:
        print repr(e)
        print "Failed to preconfig junos domain!"
        raise WistarException("Console process unexpectedly quit! Is the console already open?")

