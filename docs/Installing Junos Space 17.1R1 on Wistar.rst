Installing Junos Space 17.1R1 on Wistar
=======================================

.. _instructions: https://github.com/Juniper/wistar/blob/master/README.md
.. _website: https://www.juniper.net/support/downloads/?p=space#sw

This guide assumes you have a working Wistar installation.  If you have not installed Wistar yet, please see the installation instructions_ for both Ubuntu and VM based installs.

Requirements
------------

Junos Space minimum resource requirements:

- **vCPU:** 4
- **vRAM:** 16834

Uploading the Image
-------------------

1. Download the 17.1R1 .qcow2 KVM Appliance Image from the Juniper Networks website_.  You will need a valid username and password to do so.

SCREENSHOT

2. Once the image is downloaded, navigate to your Wistar page to upload the image.
3. Mouseover **Images** and click the **Upload Image** link.

SCREENSHOT

4. In the **Name:** field, name the image.
5. Click the **Type:** dropdown and select **Junos Space**.
6. Click the **Browse...** button next to **FilePath:** and select the downloaded .qcow2 image file location your local machine.
7. In the **Description:** field, enter a description for the image.
8. Click on the **Submit Query** button to upload.  Please note, there will not be a progress bar, so just be patient as the image is a large file.

SCREENSHOT

Building a Topology with Junos Space
------------------------------------

In this example, we'll build a topology with Junos Space and discover a vMX and a vQFX.

1. Mouseover **Topologies** and click the **Create Topology** link.
2. Click the **Add VM** link.
3. Fill in all of the necessary fields in the form, be sure to select your Junos Space image in the **Base Image** dropdown menu. *NOTE:* **Thick Provision and resize with:** may be left at 0.
4. Click **Add and Close** to finish, or **Add Another Instance** to add more instances.

Junos Space requires one external bridge and two internal bridges in order to fully operate with our topology.  Add them by clicking on the **Add Bridge** link for each required bridge.  **Be sure that you drag the connections in the following order, connections are enumerated as you drag them (eth0 first, eth1 second, etc.)**

5. **External Bridge (eth0):** br0
6. **Private Bridge 1 (eth1):** Private 1
7. **Private Bridge 2 (eth2):** Private 2
8. **eth3** will be created by automatically and attach to the **vibr0** management bridge in Wistar.

Setting up Junos Space
----------------------

Next, we'll have to make some changes under the hood to get things working.

1. Under the **KVM Deployment Status** table, click the icon that looks like a small computer monitor, this let's you access the out of band console for the Junos Space server.
2. Log in with the default username/password - **admin/abc123**
3. You will be prompted to change the **admin** password immediately, set it accordingly.

The prompts to setup the Junos Space node will now appear.

::

  This Junos Space node can be installed as one of the following:

    (S)pace Platform
      Full functionality.  Every Junos Space installation requires at least one Space node.

    (F)MPM
      Specialized to fault and performance monitoring only.
      This requires at least one Space node.

  Choose the type of node to be installed [S/F] S

4. Select **"S"** 

::

  Configuring Eth0 :

  1> Configure IPv4
  2> Configure Both IPv4 and IPv6

  R> Redraw Menu

  Choice [1-2,R]:

5. Select **1** to configure IPv4 attributes.  When prompted to enter a new IPv4 address, ensure the address belongs to your external LAN that your laptop uses to connect to the Wistar server.  In this example the LAN I'm using is 10.1.0.0/24.

::

  Please enter new IPv4 address for interface eth0
  10.1.0.205
  Please enter new IPv4 subnet mask for interface eth0
  255.255.255.0

  Enter the default IPv4 gateway as a dotted-decimal IP address:
  10.1.0.1

  Please type the IPv4 nameserver address in dotted decimal notation:
  8.8.8.8

  Configure a separate interface for device management? [y/N]

  > Configuring eth3:

  1> Configure IPv4
  2> Configure IPv6
  3> Configure Both IPv4 and IPv6

  R> Redraw Menu

  Choice [1-3,R]: 1

  Configuring IPv4 for interface eth3

  Please enter new IPv4 address for interface eth3
  192.168.122.2
  Please enter new IPv4 subnet mask for interface eth3
  255.255.255.0
  Enter the default IPv4 gateway for this interface:
  192.168.122.1

  Will this Junos Space system be added to an existing cluster? [y/N] 


  Configuring IP address for web GUI:

  1> Configure IPv4

  R> Redraw Menu

  Choice [1,R]: 1


  Please enter IPv4 address for web GUI:
  10.1.0.210

  Do you want to enable NAT service? [y/N] 

Configure an NTP server if you wish, I skip it because I don't have an issue with my lab being out of sync.

  Add NTP Server? [y/N] 

::

  Please enter display name for this node: js1

  Enter password for cluster maintenance mode:
  Re-enter password:

  Settings Summary:

  > IPv4 Change: eth0 is 10.1.0.205 / 255.255.255.0
  > Default IPv4 Gateway = 10.1.0.1 on eth0
  > IPv4 DNS add: 8.8.8.8
  > IPv4 Change: eth3 is 192.168.122.2 / 255.255.255.0
  > eth3 IPv4 Gateway: 192.168.122.1
  > Create as first node or standalone
  > Web IPv4 address is 10.1.0.210
  > Node display name is "js1"
  > Password for Junos Space maintenance mode is set.

  A> Apply settings
  C> Change settings
  Q> Quit and set up later
  R> Redraw Menu

  Choice [ACQR]: 

Space will reboot.

We can drop into the shell and make some changes to help improve performance.

:: 

  1> Change Password
  2> Change Network Settings
  3> Change Time Options
  4> Retrieve Logs
  5> Security
  6> Expand VM Drive Size
  7> (Debug) run shell

  A> Apply Changes
  Q> Quit
  R> Redraw Menu

  Choice [1-7,AQR]:

  [sudo] password for admin:
  [root@space-525400000b1f ~]# service jmp-opennms stop
  Manually stop opennms...
  opennms is running..
  Stopping OpenNMS...
  Stopping OpenNMS: [  OK  ]
  [root@space-525400000b1f ~]#
  [root@space-525400000b1f ~]# chkconfig --level 345 jmp-opennms off
  [root@space-525400000b1f ~]# service jmp-opennms stop
  Manually stop opennms...
  opennms is running..
  Stopping OpenNMS...
  Stopping OpenNMS: [  OK  ]

Another way to improve performance is to truncate some tables in mysql.

::

  [root@space-525400000b1f ~]# mysql -pnetscreen -ujboss -Dbuild_db
  Warning: Using a password on the command line interface can be insecure.
  Reading table information for completion of table and cloumn names
  You can turn off this feature to get a quicker startup with -A

  Welcome to the MySQL monitor.  Commands end with ; or \g.
  Your MySQL connection id is 140
  Server version: 5.6.35-enterprise-commercial-advanced-log MySQL Enterprise Server - Advanced Edition (Commercial)

  Copyright (C) 2000, 2016, Oracle and/or its affiliates.  All rights reserved.

  Oracle is a registered trademark of Oracle Corporation and/or its affiliates.  Other names may be trademarks of their respective owners.

  Type 'help;' or '\h' for help.  Type '\c' to clear the current input statement.

  mysql> truncate table SchemaEntity;
  Query OK, 0 rows affected (0.03 sec)

  mysql> SET FOREIGN_KEY_CHECKS = 0;
  Query OK, 0 rows affected (0.04 sec)

  mysql> truncate table DmiSchemaEntity;
  Query OK, 0 rows affected (0.03 sec)

Now we need adjust Junos Space's built-in KVM hypervisor as it will conflict with our default network that Wistar is using (192.168.122.0/24), we accomplish this by editing the references to 192.168.122.0 in the /usr/share/libvirt/networking/default.xml file.  Use your favorite text editor to accomplish this, my example uses 192.168.126.0/24.

::

  [root@space-525400000b1f ~]# cat /usr/share/libvirt/networks/default.xml
  <network>
    <name>default</name>
    <bridge name="vibr0" />
    <forward />
    <ip address="192.168.126.1" netmask="255.255.255.0">
      <dhcp>
        <range start="192.168.126.2" end="192.168.126.254" />
      </dhcp>
    </ip>
  </network>

At this point we should be able to access Junos Space via the web browser by using the IP address we set as the IPv4 web GUI address.  

#. Log in using the default web credentials **super/juniper123**.  You will immediately be prompted to change the password, do so.
#. You will need to log back in using the newly set password.

SCREENSHOT OF SPACE WELCOME PAGE




SCREENSHOT OF TOPOLOGY



SCREENSHOT

REFERENCES



