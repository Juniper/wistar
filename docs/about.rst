About Wistar
============

.. _here: https://github.com/Juniper/wistar/blob/master/README.md

Wistar is a tool to help create and share network topologies of multiple virtual machines.
It uses a drag and drop interface to make connecting instances together into large networks super easy.
These topologies can then be saved, shared, cloned, or destroyed at will. The idea is to make experimenting with
virtual networks and virtual machines as frictionless as possible.


.. image:: screenshots/screenshot.png

Wistar uses technologies like cloud-init and config-drive where possible to simplify the process
of deploying new virtual machines. It can use your existing SSH keys to provision
new instances with a known user account. VM's are modeled as javascript objects which encapsulate
all management aspects of that VM type. For example, there is a Linux type that specifies things like the
interface naming prefix == "eth". Another type models a Junos Space image, which gives hints about how much RAM and
vCPU is required. Some VMs, such as the Juniper vQFX, require multiple VMs to be 'wired' together in a particular way.
Wistar encapsulates this information and treats multi-VM instances as a single instance with the correct inter-VM
'wiring' in place.

Once a topology is created, Wistar will serialize the canvas into a JSON object and store it in a database. This
JSON object can then be serialized to HEAT for deployment to openstack, or pushed directly to KVM via libvirt.

More detailed information can be found here_. User specific configuration information can be configured in the
wistar/configuration.py file.

Supported Hypervisors / Deployment Backends
-------------------------------------------

Saved topologies can be deployed to multiple backends.

Currently implemented deployment back-ends (in order of maturity):
 - KVM
 - Openstack
 - VirtualBox (deprecated)


About the name Wistar
---------------------

.. _rat: https://en.wikipedia.org/wiki/Laboratory_rat#Wistar_rat

Wistar is named after the most commonly used laboratory rat_ in use today. Just as the venerable lab rat helps
foster learning, Wistar should be thought of as a tool to help experiment on network technologies.
