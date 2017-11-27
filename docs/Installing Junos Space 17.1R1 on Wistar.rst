Installing Junos Space 17.1R1 on Wistar
=======================================

.. _instructions: https://github.com/Juniper/wistar/blob/master/README.md
.. _website: https://www.juniper.net/support/downloads/?p=space#sw

This guide assumes you have a working Wistar installation.  If you have not installed Wistar yet, please see the installation instructions_ for both Ubuntu and VM based installs.

Requirements
------------

Junos Space minimum resource requirements:

- vCPU: 4
- vRAM: 16834

Uploading the Image
-------------------

1. Download the 17.1R1 .qcow2 KVM Appliance Image from the Juniper Networks website_.  You will need a valid username and password in order to do so.

SCREENSHOT

2. Once the image is downloaded, navigate to your Wistar page to upload the image.
3. **Mouseover** *Images* => **Click** the *Upload Image* link.

SCREENSHOT

4. In the *Name:* field, name the image.
5. **Click** the *Type:* dropdown and select *Junos Space*.
6. **Click** the *Browse...* button next to *FilePath:* and select the downloaded .qcow2 image file location your local machine.
7. In the *Description:* field, enter a description for the image.
8. **Click** on the *Submit Query* button to upload.

SCREENSHOT

Building a Topology with Junos Space
------------------------------------

In this example, we'll build a topology with Junos Space as well as one vMX device and one vQFX device.

1. **Mouseover** *Topologies* => **Click** the *Create Topology* link.
2. **Click** the *Add VM* link.
3. Fill in all of the necessary fields in the form, be sure to select your Junos Space image in the *Base Image* dropdown menu.  
   - *Thick Provision and resize with:* may be left at 0.

SCREENSHOT




