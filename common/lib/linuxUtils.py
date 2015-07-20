import re

import paramiko


# simple method to execute a cli on a remote host
# fixme - improve error handling
def execute_cli(host, username, password, cli):
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
def set_interface_ip_address(ip, username, pw, interface, interface_ip):
    flush_cmd = "ip addr flush dev " + interface
    execute_cli(ip, username, pw, flush_cmd)

    # did the user include a subnet?
    if not re.match('\d+\.\d+\.\d+\.\d+/\d+', interface_ip):
        # no, let's add a default /24 then
        interface_ip = interface_ip + "/24"

    cmd = "ip addr add " + interface_ip + " dev " + interface
    cmd = cmd + " && ip link set dev " + interface + " up"
    # fixme - there needs to be a better way to inform of failure
    # always returning a string isn't the best...
    print execute_cli(ip, username, pw, cmd)
    return True
