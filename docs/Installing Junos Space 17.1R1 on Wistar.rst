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
3. Fill in all of the necessary fields in the form, be sure to select your Junos Space image in the **Base Image** dropdown menu. NOTE: **Thick Provision and resize with:** may be left at 0.
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
2. 



SCREENSHOT OF TOPOLOGY



SCREENSHOT




