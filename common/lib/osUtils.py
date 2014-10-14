import os

# silly wrapper
def checkPath(path):
    if os.path.exists(path):
        return True
    else:
        return False

# takes an images path and an instance name
def checkImageInstance(image, instance):
    i = os.path.dirname(image) + "/" + instance + ".img"
    return checkPath(i)


# creates a thinly provisioned instance of the given image
def createThinProvisionInstance(image, instance):
    instance_file = os.path.dirname(image) + "/" + instance + ".img"
    os.system("qemu-img create -b " + image + " -f qcow2 " + instance_file)
    return True

