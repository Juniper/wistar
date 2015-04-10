import time

import pexpect

from WistarException import WistarException
import osUtils as ou


# simple utility lib to use virsh console to set up a device before 
# networking is available


def get_console(dom):
    if ou.check_is_linux():
        return pexpect.spawn("virsh console " + dom, timeout=3)
    else:
        return pexpect.spawn("socat /tmp/" + dom + ".pipe - ", timeout=3)


# is this Junos device at login yet?
# open the console and see if there a prompt
# if we don't see one in 3 seconds, return False!
def is_junos_device_at_prompt(dom):
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
                return True
            elif index == 2:
                print "at normal prompt"
                # exit cli
                child.send("exit\r")
                time.sleep(.5)
                # exit sh
                child.send("exit\r")
                time.sleep(.5)
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
        print str(child)
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
                print "Root is logged in, logging her out"
                child.send("exit\r")
                # super tricky bug here. child would exit before the command had actually been sent
                # exit sh
                time.sleep(.5)
                return True
            elif index == 2:
                print "User is logged in, logging her out"
                child.send("exit\r")
                time.sleep(.5)
                return True
            elif index == 3:
                print "At login prompt"
                return True
            elif index == 4:
                print "Could not get console"
                return False
            elif index == 5:
                child.send("\r")
                time.sleep(1)
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
        if is_junos_device_at_prompt(dom):
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
        indx = child.expect(["[^\s]\$", "[^\s]#", ".*login:", ".*assword:"], timeout=5)
        print "Found prompt: " + child.before
        if indx == 0 or indx == 1:
            # someone is already logged in on the console
            print "Logging out existing user session"
            child.send("exit\r")
        elif indx == 3:
            print "At password prompt"
            child.send("\r");
            time.sleep(1) 
        print "looking for login prompt"
        child.expect(".*login:", timeout=5)
        print "Logging in as root"
        child.send("root\r")
        child.expect("assword:", timeout=5)
        child.send(pw + "\r")
        indx = child.expect(["root.*#", "Login incorrect"], timeout=5)
        if indx == 1:
            print "Incorrect login information"
            raise WistarException("Incorrect Login Information")

        print "flushing ip information"
        child.send("ip addr flush dev " + mgmtInterface + "\r")
        child.expect("root.*#")
        print "sending ip information"
        child.send("ip addr add " + ip + "/24 dev " + mgmtInterface + "\r")
        child.expect("root.*#")
        print "sending link up"
        child.send("ip link set " + mgmtInterface + " up\r")
        child.expect("root.*#")
        print "sending hostnamectl"
        child.send("hostnamectl set-hostname " + hostname + "\r")
        child.expect("root.*#")
        print "sending exit"
        child.send("exit\r")
        print "looking for login prompt"
        child.expect(".*login:", timeout=5)
        
        return True
    
    except pexpect.TIMEOUT:
        print "Error configuring Linux domain"
        print str(child)
        return False
    
    except pexpect.EOF as e:
        print repr(e)
        print "Failed to preconfig linux domain!"
        raise WistarException("Console process unexpectidly quit! Is the console already open?")


def preconfig_junos_domain(dom, pw, em0Ip, mgmtInterface="em0"):
    try:
        needs_pw = False
        
        child = get_console(dom)
        child.send("\r")
        index = child.expect(["[^\s]>", "[^\s]#", "login:"])
        if index == 0:
            # someone is already logged in on the console
            child.send("exit\r")
            child.send("exit\r")
        elif index == 1:
            # someone is logged in and in configure mode!
            print "User is in config mode on the console!"
            raise WistarException("User is in configure mode on the console!")
    
        print "Logging in as root"
        child.send("root\r")
        
        ret = child.expect(["assword:", "root@%"])
        if ret == 0:
            print "Sending password"
            child.send(pw + "\r")
            child.expect("root@.*")
            print "Sending cli"
            child.send("cli\r")
        elif ret == 1:
            child.send("cli\r")
            # there is no password or hostname set yet
            needs_pw = True
            
        child.expect("root.*>")
        print "Sending configure private"
        child.send("configure private\r")
        ret = child.expect(["root.*#", "error.*"])
        if ret == 1:
            raise WistarException("Could not obtain private lock on db")
    
        if needs_pw:
            print "Setting root authentication"
            child.send("set system root-authentication plain-text-password\r")
            child.expect("assword:")
            print "sending first password"
            child.send(pw + "\r")
            index = child.expect(["assword:", "error:"])
            if index == 1:
                raise WistarException("Password Complexity Error")
    
            child.send(pw + "\r")
        
        print "Setting host-name to " + str(dom)
        child.send("set system host-name " + str(dom) + "\r")
        print "Turning on netconf and ssh"
        child.send("set system services netconf ssh\r")
        child.send("set system services ssh\r")
        child.send("delete interface " + mgmtInterface + "\r");
        print "Configuring " + mgmtInterface + " default to /24 for now!!!"
        child.send("set interface " + mgmtInterface + " unit 0 family inet address " + em0Ip + "/24\r")

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
    
    except pexpect.EOF as e:
        print repr(e)
        print "Failed to preconfig junos domain!"
        raise WistarException("Console process unexpectedly quit! Is the console already open?")

