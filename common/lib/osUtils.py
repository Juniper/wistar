import os
import subprocess
import platform

from jinja2 import Environment
from netaddr import *



# used to determine if we should try kvm or virtualbox
# if Linux, then KVM, otherwise, we'll fallback to VirtualBox if possible
def checkIsLinux():
    if os.uname()[0] == "Linux":
        return True
    else:
        return False        


# Is this version of linux Ubuntu based?
def checkIsUbuntu():
    dist = platform.dist()[0]
    if "buntu" in dist:
        return True
    else:
        return False


# silly wrapper
def checkPath(path):
    if os.path.exists(path):
        return True
    else:
        return False


# on linux, let's verify if a process is running
# used to check on libvirtd process status
def checkProcess(procName):
    cmd = "ps aux"
    p = subprocess.Popen(cmd, stdout=subprocess.PIPE, shell=True)
    p.wait()
    (o,e) = p.communicate()
    if procName in o:
        return True
    else:
        return False


# returns the full path and filename of an image instance
def getInstancePathFromImage(image, instance):
    return os.path.dirname(image) + "/instances/" + instance + ".img"


# takes an images path and an instance name
def checkImageInstance(image, instance):
    i = getInstancePathFromImage(image, instance)
    return checkPath(i)


# creates a thinly provisioned instance of the given image
# *If on KVM, otherwise, clone the full hd for virtualbox
def createThinProvisionInstance(image, instance):
    instance_file = getInstancePathFromImage(image, instance)
    rv = 0
    if checkIsLinux():        
        rv = os.system("qemu-img create -b '" + image + "' -f qcow2 '" + instance_file + "'")
    else:
        rv = os.system("vboxmanage clonehd '" + image + "' '" + instance_file + "'")

    if rv == 0:
        return True
    else:
        return False


def removeInstance(instance_path):
    rv = 0
    if checkIsLinux():        
        rv = os.remove(instance_path)
    else:
        rv = os.system("vboxmanage closemedium disk \"" + instance_path  + "\" --delete")
    
    if rv == 0:
        return True
    else:
        return False


def create_cloud_init_img(domain_name, host_name, mgmt_ip, mgmt_interface):
 
    try: 
        seed_dir = "/tmp/" + domain_name
        seed_img_name = seed_dir + "/seed.iso"

        rv = os.system('ls ' + seed_img_name)
        if rv == 0:
            print "seed.img already created!"
            return seed_img_name
 
        # read template 
        meta_data_template = open('./common/templates/cloud_init_meta_data')
        meta_data_template_string = meta_data_template.read()
        meta_data_template.close()

        user_data_template = open('./common/templates/cloud_init_user_data')
        user_data_template_string = user_data_template.read()
        user_data_template.close()

        env = Environment()
        meta_data = env.from_string(meta_data_template_string)
        user_data = env.from_string(user_data_template_string)
        
        ip_network = IPNetwork(mgmt_ip)
    
        config = {}
        config["hostname"] = host_name
        config["ip_address"] = ip_network.ip.format()
        config["broadcast_address"] = ip_network.broadcast.format()
        config["network_address"] = ip_network.network.format()
        config["netmask"] = ip_network.netmask.format()
        config["mgmt_interface"] = mgmt_interface
    
        meta_data_string = meta_data.render(config=config)
        user_data_string = user_data.render(config=config)
    
        if not os.system('ls ' + seed_dir):
            if not os.system('mkdir ' + seed_dir):
                return None
   
        print "writing meta-data file" 
        mdf = open(seed_dir + "/meta-data", "w")
        mdf.write(meta_data_string)
        mdf.close()

        print "writing user-data file"
        udf = open(seed_dir + "/user-data", "w")
        udf.write(user_data_string)
        udf.close()

        rv = os.system(
            'genisoimage -output {0} -volid cidata -joliet -rock {1}/user-data {2}/meta-data'.format(seed_img_name,
                                                                                                     seed_dir,
                                                                                                     seed_dir))
        if rv != 0:
            print "Could not create iso image!"
            return None

        return seed_img_name
    
    except Exception as e:
        print "Caught exception in create_cloud_init_img " + str(e)
        return None
