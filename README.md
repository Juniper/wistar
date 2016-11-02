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
            python-pexpect python-libvirt libxml2-dev libxslt1-dev unzip bridge-utils
            genisoimage python-netaddr websocket-client libffi-dev libssl-dev python-markupsafe

        root@wistar-build:~# pip install pyvbox junos-eznc pyYAML Django==1.9.9 cryptography==1.2.1
        
        Create the images and instances directories
        root@wistar-build:~# mkdir -p /opt/wistar/user_images/instances
        root@wistar-build:~# mkdir -p /opt/wistar/seeds
        root@wistar-build:~# mkdir -p /opt/wistar/media

        Clone the repo
        root@wistar-build:/opt/wistar# git clone https://github.com/nembery/wistar.git
        
        create the sql tables
        root@wistar-build:/opt/wistar# cd wistar-master/
        root@wistar-build:/opt/wistar/wistar-master# ./manage.py migrate
        --snip--
        root@wistar-build:/opt/wistar/wistar-master#
        
	For development you can use the built-in web server, or configure apache to start wistar for you
        Launch the built-in web server:
        root@wistar-build:/opt/wistar# cd wistar-master/
        root@wistar-build:/opt/wistar/wistar-master# ./manage.py runserver 0.0.0.0:8080

	To configure apache:
	apt-get install libapache2-mod-wsgi

	root@wistar-build:~# cat /etc/apache2/sites-enabled/999-wistar.conf 
	Define wistar_path /opt/wistar
	Listen 8080
	<VirtualHost *:8080>
	    WSGIScriptAlias / ${wistar_path}/wistar/wsgi.py
	    WSGIDaemonProcess wistar python-path=${wistar_path}
	    WSGIProcessGroup wistar
	    ErrorLog /var/log/apache2/wistar.log
	    CustomLog /var/log/apache2/wistar_access.log combined
	    Alias /static/ ${wistar_path}/common/static/
	
	    <Directory "${wistar_path}/common/static">
	        Require all granted
	    </Directory>
	    <Directory ${wistar_path}>
	        <Files wsgi.py>
	            Require all granted
	        </Files>
	    </Directory>
	</VirtualHost>


	Also, ensure the apache user is in the libvirtd group

	root@wistar-build:~# cat /etc/group | grep libvirt
	libvirtd:x:111:nembery,nova,www-data
	
	
	To begin, browse to the 'Images' page and upload a qcow2 based image. 
	
	Now, browse to Topologies to create and deploy a new network!
	
	Send questions to nembery@juniper.net / nembery@gmail.com
	
	Happy Hacking!
	
