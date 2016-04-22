wistar
======

Wistar is a tool to manage a topologies of VMs on a KVM server. You can quickly setup complex topologies of 
multiple instances, generate all the necessary KVM XML domain and network configurations, and deploy the topology.

To get started, you need a server running Ubuntu 14.04 (or some similar flavor) with libvirt, kvm and few python tools:

Set up networking to use a default bridge called br0. Wistar will use this bridge to connect instances to the
external network.

        auto lo
        iface lo inet loopback
        
        iface eth1 inet manual

        auto br0
        iface br0 inet static
                address 10.10.11.60
                netmask 255.255.240.0
                network 10.10.0.0
                broadcast 10.10.15.255
                gateway 10.10.10.1
                # dns-* options are implemented by the resolvconf package, if installed
                dns-nameservers 8.8.8.8
                bridge_ports eth1
                bridge_stp off
                bridge_fd 0
                bridge_maxwait 0

        Install all required packages:
        root@dc17-all:~# apt-get install python-pip python-dev build-essential qemu-kvm libz-dev libvirt-bin socat
            python-pexpect python-libvirt python-django libxml2-dev libxslt1-dev unzip bridge-utils python-numpy
            genisoimage netaddr

        root@dc17-all:~# pip install pyvbox junos-eznc pyYAML
        
        Create the images and instances directories
        root@dc17-all:~# mkdir -p /opt/images/user_images/instances
        
        Clone the repo
        root@dc17-all:/opt/wistar# git clone https://github.com/nembery/wistar.git
        
        create the sql tables
        root@dc17-all:/opt/wistar# cd wistar-master/
        root@dc17-all:/opt/wistar/wistar-master# ./manage.py syncdb
        Creating tables ...
        --snip--
        
        You just installed Django's auth system, which means you don't have any superusers defined.
        Would you like to create one now? (yes/no): no
        Installing custom SQL ...
        Installing indexes ...
        Installed 0 object(s) from 0 fixture(s)
        root@dc17-all:/opt/wistar/wistar-master#
        
        Answer ‘no’ when asked to create an admin user as this is not currently used.
        Launch the built-in webserver:
        root@dc17-all:/opt/wistar# cd wistar-master/
        root@dc17-all:/opt/wistar/wistar-master# ./manage.py runserver 0.0.0.0:8080

To begin, browse to the 'Images' page and upload a qcow2 based image. 

Now, browse to Topologies to create and deploy a new network.

Send questions to nembery@juniper.net / nembery@gmail.com

Happy Hacking!

