from django.shortcuts import render, get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.template.loader import render_to_string
from django.http import HttpResponseRedirect, HttpResponse
from topologies.models import Topology
from common.lib.wistarException import wistarException
import common.lib.wistarUtils as wu
import common.lib.libvirtUtils as lu
import common.lib.consoleUtils as cu
import common.lib.osUtils as ou
import common.lib.junosUtils as ju
import common.lib.vboxUtils as vu
from images.models import Image
import logging
import time
import json

# FIXME = debug should be a global setting
debug = True

def index(request):
    latest_topo_list = Topology.objects.all().order_by('modified')[:10]
    context = {'latest_topo_list': latest_topo_list}
    return render(request, 'index.html', context)

def edit(request):
    image_list = Image.objects.all().order_by('name')
    context = {'image_list': image_list}
    return render(request, 'edit.html', context)

def copy(request, topo_id):
    topo  = get_object_or_404(Topology, pk=topo_id)
    image_list = Image.objects.all().order_by('name')
    context = {'image_list': image_list, 'topo_id' : topo_id, 'topo' : topo}
    return render(request, 'edit.html', context)

def detail(request, topo_id):
    topo  = get_object_or_404(Topology, pk=topo_id)
    image_list = Image.objects.all().order_by('name')
    context = {'image_list': image_list, 'topo_id' : topo_id, 'topo' : topo}
    return render(request, 'edit.html', context)

def delete(request, topo_id):
    topo  = get_object_or_404(Topology, pk=topo_id)
    topo.delete()
    return HttpResponseRedirect('/topologies/')

def error(request):
    return render(request, 'error.html')

# take the topology id and generate a set of scripts to deploy the topology, possibly on another box
def dumpKvm(request, topo_id):
    topo  = get_object_or_404(Topology, pk=topo_id)
    # let's parse the json and convert to simple lists and dicts
    config = wu.loadJson(topo.json, topo_id)
    return render(request, 'kvmCreateScript.html', {'topo': topo, 'config' : config})

# take the topology id and deploy to the local machine using python libvirt
def deploy(request, topo_id):
    topo  = get_object_or_404(Topology, pk=topo_id)
    # let's parse the json and convert to simple lists and dicts
    config = wu.loadJson(topo.json, topo_id)
    # lu.resetKvm()
    time.sleep(1)
    
    # only create networks on Linux/KVM

    print "Checking if we should create networks first!"
    if ou.checkIsLinux():
        for network in config["networks"]:
            try:
                if not lu.networkExists(network["name"]):
                    if debug:
                        print "Rendering networkXml for: " + network["name"]
                    networkXml = render_to_string("kvm/network.xml", {'network' : network})
                    n = lu.defineNetworkFromXml(networkXml)
                    if n == False:
                        err_msg = "Error defining network: " + network["name"]
                        context = {'error' : err_msg }
                        return render(request, 'error.html', context) 
                    
                print "Starting network"
                lu.startNetwork(network["name"])
            except:
                err_msg = "Error starting network: " + network["name"]
                context = {'error' : err_msg }
                return render(request, 'error.html', context) 
        
    time.sleep(1)    
    for device in config["devices"]:
        try:
            if not lu.domainExists(device["name"]):
                if debug:
                    print "Rendering deviceXml for: " + device["name"]
                
                image = Image.objects.get(pk=device["imageId"])
                instancePath = ou.getInstancePathFromImage(image.path, device["name"])
            
                if ou.checkIsLinux():
                    deviceXml = render_to_string("kvm/domain.xml", {'device' : device, 'instancePath' : instancePath})
                else:
                    deviceXml = render_to_string("vbox/domain.xml", {'device' : device, 'instancePath' : instancePath})
    
                if debug:
                    print "Checking that image instance exists at " + str(instancePath)
            
                if ou.checkImageInstance(image.path, device["name"]):
                    print "Image Instance already exists"
                else:
                    print "Image Instance does not exist"
                    if ou.createThinProvisionInstance(image.path, device["name"]):
                        print "Successly created instance"
                    else:
                        context = {'error' : 'Could not create image instance for image: ' + image.path }
                        return render(request, 'error.html', context) 
             
                if debug:
                    print "Defining domain"
                d = lu.defineDomainFromXml(deviceXml)
                if d == False:
                    err_msg = "Error defining Instance: " + device["name"] 
                    context = {'error' : err_msg }
                    return render(request, 'error.html', context) 

            if not ou.checkIsLinux():
                # perform some special hacks for vbox
                vu.preconfigureVMX(device["name"])

            #print "Starting domain! " + device["name"]
            #lu.startDomainByName(device["name"])
        except Exception as ex:
            print ex
            err_msg = "Error starting Instance: " + device["name"] 
            context = {'error' : err_msg }
            return render(request, 'error.html', context) 
             
    return HttpResponseRedirect('/topologies/manageKvm')

def manageKvm(request):
    domains = lu.listDomains()
    if ou.checkIsLinux(): 
        networks = lu.listNetworks()
    else:
        networks = []

    return render(request, 'kvm.html', {'domains': domains, 'networks' : networks})

def viewDomain(request, domain_id):
    domain = lu.getDomainByUUID(domain_id)
    return render(request, 'viewDomain.html', {'domain': domain, 'xml' : domain.XMLDesc(0)})

def startDomain(request, domain_id):
    ret = lu.startDomain(domain_id)
    if ret == True:
        return HttpResponseRedirect('/topologies/manageKvm/')
    else:
        return HttpResponseRedirect('/topologies/error/')

def stopDomain(request, domain_id):
    ret = lu.stopDomain(domain_id)
    if ret == True:
        return HttpResponseRedirect('/topologies/manageKvm/')
    else:
        return HttpResponseRedirect('/topologies/error/')

def undefineDomain(request, domain_id):
    sourceFile = lu.getImageForDomain(domain_id)
    if sourceFile is not None:
        ou.removeInstance(sourceFile)
    else:
        print "Nothing to delete!"

    lu.undefineDomain(domain_id)
    return HttpResponseRedirect('/topologies/manageKvm/')

def viewNetwork(request, network_name):
    network = lu.getNetworkByName(network_name)
    return render(request, 'viewNetwork.html', {'network': network, 'xml' : network.XMLDesc(0)})

    lu.startNetwork(network_name)
    return HttpResponseRedirect('/topologies/manageKvm/')

def startNetwork(request, network_name):
    lu.startNetwork(network_name)
    return HttpResponseRedirect('/topologies/manageKvm/')

def stopNetwork(request, network_name):
    lu.stopNetwork(network_name)
    return HttpResponseRedirect('/topologies/manageKvm/')

def undefineNetwork(request, network_name):
    lu.undefineNetwork(network_name)
    return HttpResponseRedirect('/topologies/manageKvm/')

def create(request):
    try:
        if request.POST.has_key('id'):
            topo_id = request.POST['id']
            topo = get_object_or_404(Topology, pk=topo_id)
            topo.json = request.POST['json']
            topo.name = request.POST['name']
            topo.description = request.POST['description']
            topo.save()
        else:
            json = request.POST['json']
            description = request.POST['description']
            name = request.POST['name']
            t = Topology(name=name, description=description, json=json)
            t.save()

    except (KeyError):
        return render(request, 'topologies/error.html', { 
            'error_message': "error"
    })
    else:
        # Always return an HttpResponseRedirect after successfully dealing # with POST data. This prevents data from being posted twice if a
        # user hits the Back button.
        # return HttpResponseRedirect(reverse('topologies:converted', args=(p.id,)))
        # context = { 'json': json, 'name' : name, 'description' : description }
        # return render(request, 'topologies/output.html', context)
        return HttpResponseRedirect('/topologies/')


