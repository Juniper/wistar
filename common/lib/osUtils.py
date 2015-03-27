import os
import subprocess
import platform

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



