wistar
======

Wistar is a tool to manage a vMX topologies on a KVM server. You can quickly setup complex topologies of 
multiple vMX instances, generate all the necessary KVM configurations, and quickly deploy the topology.

To get started, you need a server running Ubuntu 14.04 (or some similar flavor) with libvirt, kvm and few python tools:

Set up networking to use a default bridge called br0. Wistar will use this bridge to connect instances to the
external network.

# The loopback network interface
auto lo
iface lo inet loopback

# The primary network interface
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

Download the latest wistar source from here:
https://git.juniper.net/nembery/wistar or as a zip (archive.zip)
unzip into the /opt/wistar directory
unzip the file and create the sql tables
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

To begin, browse to the 'Images' page and upload a vMX image. (jinstall-vmx-14.1R1.10-domestic.img has been known to
work well). Choose 'vMX <= 14.2' as the image type if this is a phase 1 vMX image.

Now, browse to Topologies to create and deploy a new network.

More information can be found at the Wistar Project site here:
https://junipernetworks.sharepoint.com/sites/open1/wistar/SitePages/Community%20Home.aspx

Send questions to nembery@juniper.net 

Happy networking!

