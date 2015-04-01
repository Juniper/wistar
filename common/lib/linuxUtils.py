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
    cmd = "ip addr add " + ifaceIp + "/24 dev " + iface
    cmd = cmd + " && ip link set dev " + iface + " up"
    # fixme - there needs to be a better way to inform of failure
    # always returning a string isn't the best...
    print executeCli(ip, username, pw, cmd)
    return True
