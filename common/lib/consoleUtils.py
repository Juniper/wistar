from wistarException import wistarException
import osUtils as ou
import pexpect
import sys
import time

# simple utility lib to use virsh console to set up a device before 
# networking is available

def getConsole(dom):
    if ou.checkIsLinux():
        return pexpect.spawn("virsh console " + dom, timeout=3)
    else:
        return pexpect.spawn("socat /tmp/" + dom + ".pipe - ", timeout=3)


# is this Junos device at login yet?
# open the console and see if there a prompt
# if we don't see one in 3 seconds, return False!
def isJunosDeviceAtPrompt(dom):
    print "Getting bootup state of: " + str(dom)
    try:
        child = getConsole(dom)
        child.send("\r")
        indx = child.expect(["error: failed to get domain", "[^\s]>", "[^\s]#", "login:"])
        if indx == 0:
            print "Domain is not configured!"
            return False
        # no timeout indicates we are at some sort of prompt!
        return True
    except pexpect.TIMEOUT as t:
        print "console is available, but not at login prompt"
        return False
    except:
        print "console does not appear to be available"
        return False


def preconfigJunosDomain(dom, pw, em0Ip):
    try:
        needsPw = False
        
        child = getConsole(dom)
        child.send("\r")
        indx = child.expect(["[^\s]>", "[^\s]#", "login:"])
        if indx == 0:
            # someone is already logged in on the console
            child.send("exit\r")
            child.send("exit\r")
        elif indx == 1:
            # someone is logged in and in configure mode!
            print "User is in config mode on the console!"
            raise wistarException("User is in configure mode on the console!")
    
        print "Loggin in as root"
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
            needsPw = True
            
        child.expect("root.*>")
        print "Sending configure private"
        child.send("configure private\r")
        ret = child.expect(["root.*#", "error.*"])
        if ret == 1:
            raise wistarException("Could not obtain private lock on db")
    
        if needsPw:
            print "Setting root authentication"
            child.send("set system root-authentication plain-text-password\r")
            child.expect("assword:")
            print "sending first password"
            child.send(pw + "\r")
            indx = child.expect(["assword:", "error:"])
            if indx == 1: 
                raise wistarException("Password Complexity Error")
    
            child.send(pw + "\r")
        
        print "Setting host-name to " + str(dom)
        child.send("set system host-name " + str(dom) + "\r")
        print "Turning on netconf and ssh"
        child.send("set system services netconf ssh\r")
        child.send("set system services ssh\r")
        child.send("delete interface em0\r");
        print "Configuring fxp0 - default to /24 for now!!!"
        child.send("set interface fxp0 unit 0 family inet address " + em0Ip + "/24\r")
        print "Committing changes"
        child.send("commit and-quit\r")
        time.sleep(3)
        child.send("quit\r")
        time.sleep(1)
        child.send("exit\r")
        time.sleep(1)
        child.send("exit\r")
        print "all-done"

        return True
        print repr(t)
        print "Failed to preconfig junos domain!"
        raise wistarException("Timed out trying to preconfigure device!")
    
    except pexpect.EOF as e:
        print repr(e)
        print "Failed to preconfig junos domain!"
        raise wistarException("Console process unexpectidly quit! Is the console already open?")
    
