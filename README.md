wistar
======

Wistar is a tool to help manage complex topologies of Virtual Machines and appliances. By default, Wistar is used to 
simplify the process of creating networks of VMs on KVM, however, other deployment methods such as Openstack are being 
developed.


Quick Start instructions for KVM deployments:
======
To get started, you need a server running Ubuntu 14.04 (or some similar flavor) with libvirt, kvm and a few python
tools:

Wistar uses Linux bridges to connect VMs to each other and to any external networks. To connect VMs to the external
 world, you'll need at least one NIC in a bridge. In this example, the first NIC is put in a bridge called 'br0'. To
 connect VMs to this NIC, add an 'External Bridge' object to the topology with the corresponding name 'br0'. Multiple
 external bridges are supported.

        auto lo
        iface lo inet loopback
        
        iface eth0 inet manual

        auto br0
        iface br0 inet static
                address 10.10.11.60
                netmask 255.255.240.0
                network 10.10.0.0
                broadcast 10.10.15.255
                gateway 10.10.10.1
                dns-nameservers 8.8.8.8
                bridge_ports eth0
                bridge_stp off
                bridge_fd 0
                bridge_maxwait 0

        Install all required packages:
        root@wistar-build:~# apt-get install python-pip python-dev build-essential qemu-kvm libz-dev libvirt-bin socat
            python-pexpect python-libvirt libxml2-dev libxslt1-dev unzip bridge-utils python-numpy
            genisoimage python-netaddr

        root@wistar-build:~# pip install pyvbox junos-eznc pyYAML Django==1.8.13
        
        Create the images and instances directories
        root@wistar-build:~# mkdir -p /opt/images/user_images/instances
        
        Clone the repo
        root@wistar-build:/opt/wistar# git clone https://github.com/nembery/wistar.git
        
        create the sql tables
        root@wistar-build:/opt/wistar# cd wistar-master/
        root@wistar-build:/opt/wistar/wistar-master# ./manage.py syncdb
        Creating tables ...
        --snip--
        
        You just installed Django's auth system, which means you don't have any superusers defined.
        Would you like to create one now? (yes/no): no
        Installing custom SQL ...
        Installing indexes ...
        Installed 0 object(s) from 0 fixture(s)
        root@wistar-build:/opt/wistar/wistar-master#
        
        Answer ‘no’ when asked to create an admin user as this is not currently used.
        Launch the built-in web server:
        root@wistar-build:/opt/wistar# cd wistar-master/
        root@wistar-build:/opt/wistar/wistar-master# ./manage.py runserver 0.0.0.0:8080

To begin, browse to the 'Images' page and upload a qcow2 based image. 

Now, browse to Topologies to create and deploy a new network.

Send questions to nembery@juniper.net / nembery@gmail.com

Happy Hacking!

