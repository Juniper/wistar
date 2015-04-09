import re

import paramiko



# simple method to execute a cli on a remote host
# fixme - improve error handling
def executeCli(host, username, password, cli):
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(hostname=host, username=username, password=password)
    stdin, stdout, stderr = client.exec_command(cli)
    err = stderr.read()
    if err != "":
        return err
    else:
        return stdout.read()


# set an IP on an interface and return to user
def setInterfaceIpAddress(ip, username, pw, iface, ifaceIp):
    flushCmd = "ip addr flush dev " + iface
    executeCli(ip, username, pw, flushCmd)

    # did the user include a subnet?
    if not re.match('\d+\.\d+\.\d+\.\d+/\d+', ifaceIp):
        # no, let's add a default /24 then
        ifaceIp = ifaceIp + "/24"

    cmd = "ip addr add " + ifaceIp + " dev " + iface
    cmd = cmd + " && ip link set dev " + iface + " up"
    # fixme - there needs to be a better way to inform of failure
    # always returning a string isn't the best...
    print executeCli(ip, username, pw, cmd)
    return True
