from topologies.lib.wistarException import wistarException
import pexpect
import sys
import time

# sometimes you just gotta screen scrape :-/
# will one-day use netconf ... 
# very simple function to log into a domain, set a root pw if necessary and set the em0 
# to an IP
def preconfigJunosDomain(dom, pw, em0Ip):
	try:
		needsPw = False
		
		child = pexpect.spawn("virsh console " + dom)
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
			child.send(pw + "\r")
			child.expect("assword:")
			child.send(pw + "\r")
		
		print "Setting hostname"
		child.send("set system hostname " + dom + "\r")
		print "Turning on netconf and ssh"
		child.send("set system services netconf ssh\r")
		child.send("set system services ssh\r")
		child.send("delete interface em0\r");
		print "Configuring em0 - default to /24 for now!!!"
		child.send("set interface em0 unit 0 family inet address " + em0Ip + "/24\r")
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
	except pexpect.TIMEOUT as t:
		print repr(t)
		print "Failed to preconfig junos domain!"
		raise wistarException("Timed out trying to preconfigure device!")
	
	except pexpect.EOF as e:
		print repr(e)
		print "Failed to preconfig junos domain!"
		raise wistarException("Console process unexpectidly quit! Is the console already open?")
	
