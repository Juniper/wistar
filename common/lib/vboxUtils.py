# 10-24-14 nembery
import virtualbox

from wistar import configuration

vbox_session = ""


def init_session():
    global vbox_session
    if vbox_session == "":
        vbox_session = virtualbox.VirtualBox()


def get_vm_host_only_net_name(host_only_net_ip_address):
    from vbhonetutil import VBHONetUtil
    host_only_net_name = configuration.virtual_box_host_only_net_name
    if host_only_net_ip_address is not None:
        host_only_network_util = VBHONetUtil()
        host_only_net_name = host_only_network_util.getHostOnlyNetworkNameByGuestIP(host_only_net_ip_address)
    print " get_vm_host_only_net_name():  %s ==> %s" % (host_only_net_ip_address, host_only_net_name)
    return host_only_net_name


def get_instance(name):
    init_session()
    instance = vbox_session.find_machine(name)
    return instance


def get_vm_session(name):
    try:
        m = get_instance(name)
        session = m.create_session()
        instance = session.machine 
        return session, instance
    except Exception:
        print "Could not get VM Session"
        return None


def save_session(session, instance):
    try:
        instance.save_settings()
        session.unlock_machine() 
        return True
    except Exception:
        print "Could not save session"
        # try to unlock again!
        session.unlock_machine() 
        return False


def preconfigure_vmx(name, mgmtipaddr):
    (session, instance) = get_vm_session(name)
    if not remove_extraneous_controllers(instance):
        session.unlock_machine() 
        return False

    if not set_serial_port_as_server(instance):
        session.unlock_machine() 
        return False

    if not set_management_network(instance, mgmtipaddr):
        session.unlock_machine() 
        return False

    return save_session(session, instance)


def remove_extraneous_controllers(instance):
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
def set_management_network(instance, mgmtipaddr):
    try:
        iface = instance.get_network_adapter(0)
        iface.enabled = True
        # iface.host_only_interface = 'vboxnet0'
        iface.host_only_interface = get_vm_host_only_net_name(mgmtipaddr)
        iface.attachment_type = virtualbox.library.NetworkAttachmentType(4)
        return True
    except Exception:
        print "Could not set managment network on first interface"
        return False


# get the first serial port
# and set it to 'create' by default
def set_serial_port_as_server(instance):
    try:
        sp = instance.get_serial_port(0)

        if sp.server is True:
            return True

        sp.server = True
        return True
    except Exception:
        print "Could not set serial port pipe"
        return False
