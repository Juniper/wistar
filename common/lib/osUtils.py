import os
import subprocess
import platform
import shutil

from jinja2 import Environment
from netaddr import *

from wistar import settings

# used to determine if we should try kvm or virtualbox
# if Linux, then KVM, otherwise, we'll fallback to VirtualBox if possible
def check_is_linux():
    if os.uname()[0] == "Linux":
        return True
    else:
        return False        


# Is this version of linux Ubuntu based?
def check_is_ubuntu():
    dist = platform.dist()[0]
    if "buntu" in dist:
        return True
    else:
        return False


# silly wrapper
def check_path(path):
    if os.path.exists(path):
        return True
    else:
        return False


# on linux, let's verify if a process is running
# used to check on libvirtd process status
def check_process(procName):
    cmd = "ps aux"
    p = subprocess.Popen(cmd, stdout=subprocess.PIPE, shell=True)
    p.wait()
    (o, e) = p.communicate()
    if procName in o:
        return True
    else:
        return False


def check_ip(ip_address):
    """ check to see if the given ip address is already reachable """

    rv = os.system("ping -c 1 -q %s " % ip_address)
    if rv == 0:
        print "IP Exists and is pingable"
        return True
    else:
        return False


# returns the full path and filename of an image instance
def get_instance_path_from_image(image, instance):
    return os.path.dirname(image) + "/instances/" + instance + ".img"


# takes an images path and an instance name
def check_image_instance(image, instance):
    i = get_instance_path_from_image(image, instance)
    return check_path(i)


def copy_image_to_clone(old_path, new_path):
    shutil.copy(old_path, new_path)


# creates a thinly provisioned instance of the given image
# *If on KVM, otherwise, clone the full hd for virtualbox
def create_thin_provision_instance(image, instance):
    instance_file = get_instance_path_from_image(image, instance)
    if check_is_linux():
        rv = os.system("qemu-img create -b '" + image + "' -f qcow2 '" + instance_file + "'")
    else:
        rv = os.system("vboxmanage clonehd '" + image + "' '" + instance_file + "'")

    if rv == 0:
        return True
    else:
        return False


# creates a new blank image
# useful for installing from ISO files
def create_blank_image(filename, size):

    if check_is_linux():
        rv = os.system("qemu-img create '" + filename + "' -f qcow2 " + size)
    else:
        print "VirtualBox isn't supported for this feature! (yet anyway, patches welcome)"
        rv = 1

    if rv == 0:
        return True
    else:
        return False


# simple wrapper around os library
# should provide additional functionality for vBox environments
def list_dir(directory):
    if os.path.isdir(directory):
        return os.listdir(directory)
    else:
        return []


def is_image_thin_provisioned(image_path):
    """ Check to see if the qemu-img info command reports a backing file """
    if check_is_linux():
        rv = os.system("qemu-img info " + image_path + " | grep backing")
        if rv == 0:
            print "Found a backing file!"
            return True
        else:
            return False
    else:
        # non linux hosts (i.e. virtualbox) will never have a backing file
        return False


def remove_instance(instance_path):
    rv = 0
    if check_is_linux():
        if os.path.exists(instance_path):
            os.remove(instance_path)
    else:
        rv = os.system("vboxmanage closemedium disk \"" + instance_path  + "\" --delete")
    
    if rv == 0:
        return True
    else:
        return False


def remove_instances_for_topology(topology_id_prefix):
    directory = settings.MEDIA_ROOT + "/user_images/instances"
    for entry in os.listdir(directory):
        full_path = os.path.join(entry, directory)
        if entry.startswith(topology_id_prefix):
            print "Removing stale entry: " + full_path
            os.remove(full_path)


def create_cloud_init_img(domain_name, host_name, mgmt_ip, mgmt_interface, password, script="", script_param=""):
 
    try: 
        seed_dir = "/tmp/" + domain_name
        seed_img_name = seed_dir + "/seed.iso"

        if not check_path(seed_dir):
            os.mkdir(seed_dir)

        if check_path(seed_img_name):
            print "seed.img already created!"
            return seed_img_name
 
        # read template
        this_path = os.path.abspath(os.path.dirname(__file__))
        meta_data_template_path = os.path.abspath(os.path.join(this_path, "../templates/cloud_init_meta_data"))
        user_data_template_path = os.path.abspath(os.path.join(this_path, "../templates/cloud_init_user_data"))

        print meta_data_template_path

        print user_data_template_path

        meta_data_template = open(meta_data_template_path)
        meta_data_template_string = meta_data_template.read()
        meta_data_template.close()

        if script == "":
            user_data_template = open(user_data_template_path)
            user_data_template_string = user_data_template.read()
            user_data_template.close()
        else:
            user_data_template_string = script

        env = Environment()
        meta_data = env.from_string(meta_data_template_string)
        user_data = env.from_string(user_data_template_string)
        
        ip_network = IPNetwork(mgmt_ip)
    
        config = dict()
        config["domain_name"] = domain_name
        config["hostname"] = host_name
        config["ip_address"] = ip_network.ip.format()
        config["broadcast_address"] = ip_network.broadcast.format()
        config["network_address"] = ip_network.network.format()
        config["netmask"] = ip_network.netmask.format()
        config["mgmt_interface"] = mgmt_interface
        config["password"] = password

        if script_param != "":
            config["param"] = script_param
    
        meta_data_string = meta_data.render(config=config)
        user_data_string = user_data.render(config=config)
    
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


def remove_cloud_init_tmp_dirs(topology_prefix):
    print "deleting cloud config drive for %s" % topology_prefix
    seed_dir = '/tmp'
    dirs = os.listdir(seed_dir)
    try:
        for d in dirs:
            full_path = os.path.join(seed_dir, d)
            print "checking %s" % d
            if topology_prefix in d and os.path.isdir(full_path):
                print "we found a domain config dir at %s" % full_path
                for f in os.listdir(full_path):
                    print "deleting cloud-init file: %s" % f
                    os.remove(os.path.join(full_path, f))

                print "removing dir %s" % d
                os.rmdir(full_path)

    except Exception as e:
        # smother error
        print str(e)
