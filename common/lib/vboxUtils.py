# 10-24-14 nembery
import virtualbox

vbox = ""

def initSession():
    global vbox
    if vbox == "":
        vbox = virtualbox.VirtualBox()

def getVMHONetName(hoNetIPAddr):
    from vbhonetutil import VBHONetUtil
    honetName = 'vboxnet0'
    if (hoNetIPAddr != None):
        vbhoNetUtil = VBHONetUtil()
        honetName = vbhoNetUtil.getHostOnlyNetworkNameByGuestIP(hoNetIPAddr)
    print " getVMHONetName():  %s ==> %s" % (hoNetIPAddr, honetName)
    return honetName

def getInstance(name):
    initSession()
    instance = vbox.find_machine(name)
    return instance


def getVMSession(name):
    try:
        m = getInstance(name)
        session = m.create_session()
        instance = session.machine 
        return (session, instance)
    except Exception:
        print "Could not get VM Session"
        return None

def saveSession(session, instance):
    try:
        instance.save_settings()
        session.unlock_machine() 
        return True
    except Exception:
        print "Could not save session"
        # try to unlock again!
        session.unlock_machine() 
        return False


def preconfigureVMX(name, mgmtipaddr):
    (session, instance) = getVMSession(name)
    if not removeExtraniousControllers(instance):
        session.unlock_machine() 
        return False

    if not setSerialPortAsServer(instance):
        session.unlock_machine() 
        return False

    if not setManagementNetwork(instance, mgmtipaddr):
        session.unlock_machine() 
        return False

    return saveSession(session, instance)


def removeExtraniousControllers(instance):
    try:
        controllers = instance.storage_controllers
        for c in controllers:
            if c.name != "IDE Controller":
                print "Removing " + str(c.name)
                instance.remove_storage_controller(c.name)
       
        return True
    except Exception:
        print "Could not modify controllers"
        return False

# get the first interface and set it to be a host only network called vboxnet0
def setManagementNetwork(instance, mgmtipaddr):
    try:
        iface = instance.get_network_adapter(0)
        iface.enabled = True
        # iface.host_only_interface = 'vboxnet0'
        iface.host_only_interface = getVMHONetName(mgmtipaddr)
        iface.attachment_type = virtualbox.library.NetworkAttachmentType(4)
        return True
    except Exception:
        print "Could not set managment network on first interface"
        return False


# get the first serial port
# and set it to 'create' by default
def setSerialPortAsServer(instance):
    try:
        sp = instance.get_serial_port(0)

        if sp.server == True:
            return True

        sp.server = True
        return True
    except Exception:
        print "Could not set serial port pipe"
        return False
