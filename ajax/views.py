from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponseRedirect, HttpResponse
from django.template.loader import render_to_string
from django.conf import settings
from common.lib.wistarException import wistarException
import common.lib.wistarUtils as wu
import common.lib.libvirtUtils as lu
import common.lib.junosUtils as ju
import common.lib.consoleUtils as cu
import common.lib.osUtils as ou
import common.lib.vboxUtils as vu
from images.models import Image
from topologies.models import Topology
# import logging
import time
import json

# FIXME = debug should be a global setting
debug = True

def index(request):
    return HttpResponseRedirect('/topologies/')

# fixme - remove need for csrf_exempt!
@csrf_exempt
def preconfigJunosDomain(request):
    response_data = {}
    if request.POST.has_key('domain'):
        domain = request.POST['domain']
        # if not lu.domainExists(domain):
        #    print "Domain not defined!"
        #    response_data["result"] = False
        #    response_data["message"] = "Domain is not defined!"
        #    return HttpResponse(json.dumps(response_data), content_type="application/json")

        password = request.POST['password']
        ip = request.POST['ip']
        print "Configuring domain:" + str(domain)
        try:
            response_data["result"] = cu.preconfigJunosDomain(domain, password, ip)
            print str(response_data)
            return HttpResponse(json.dumps(response_data), content_type="application/json")
        except KeyError as k:
            print repr(k)
            response_data["result"] = False
            response_data["message"] = "Invalid Parameters! Is there a password set?"
            return HttpResponse(json.dumps(response_data), content_type="application/json")
        except wistarException as we:
            print we
            response_data["result"] = False
            response_data["message"] = str(we)
            return HttpResponse(json.dumps(response_data), content_type="application/json")
    else:
        response_data["result"] = False
        response_data["message"] = "Invalid POST data"
        return HttpResponse(json.dumps(response_data), content_type="application/json")

@csrf_exempt
def configJunosInterfaces(request):
    response_data = {}
    if request.POST.has_key('ip'):
        ip = request.POST['ip']
        password = request.POST['password']
        print "Configuring interfaces for " + str(ip)
        try:
            response_data["result"] = ju.configJunosInterfaces(ip, password)
            print str(response_data)
            return HttpResponse(json.dumps(response_data), content_type="application/json")
        except wistarException as we:
            print we
            response_data["result"] = False
            response_data["message"] = str(we)
            return HttpResponse(json.dumps(response_data), content_type="application/json")
    else:
        response_data["result"] = False
        response_data["message"] = "No ip in POST"
        return HttpResponse(json.dumps(response_data), content_type="application/json")
   
@csrf_exempt
def executeCli(request):
    response_data = {}
    requiredFields = set([ 'ip', 'pw', 'cli' ])
    if not requiredFields.issubset(request.POST):
        return render(request, 'ajax/ajaxError.html', { 'error' : "Invalid Parameters in POST" } )

    ip = request.POST['ip']
    pw = request.POST['pw']
    cli  = request.POST['cli']

    result = ju.executeCli(ip,pw,cli)
    if result == None:
        response_data["result"] = False
        return HttpResponse(json.dumps(response_data), content_type="application/json")
    else: 
        response_data["result"] = True
        response_data["output"] = result 
        return HttpResponse(json.dumps(response_data), content_type="application/json")

@csrf_exempt
def getJunosStartupState(request):
    response_data = {}
    if request.POST.has_key('name'):
        name = request.POST['name']
        response_data["result"] = cu.isJunosDeviceAtPrompt(name)
        return HttpResponse(json.dumps(response_data), content_type="application/json")
    else:
        response_data["result"] = False
        response_data["message"] = "No domain name in POST"
        return HttpResponse(json.dumps(response_data), content_type="application/json")

@csrf_exempt
def getJunosConfig(request):
    response_data = {}
    if request.POST.has_key('ip'):
        ip = request.POST['ip']
        password = request.POST['password']
        print "Getting Config for " + str(ip) + " " + str(password)
        try:
            xml = ju.getConfig(ip, password)
            print xml
            response_data["result"] = True
            return HttpResponse(json.dumps(response_data), content_type="application/json")
        except wistarException as we:
            print we
            response_data["result"] = False
            response_data["message"] = str(we)
            return HttpResponse(json.dumps(response_data), content_type="application/json")
    else:
        response_data["result"] = False
        response_data["message"] = "No ip in POST"
        return HttpResponse(json.dumps(response_data), content_type="application/json")


@csrf_exempt
def syncLinkData(request):
    response_data = {}
    if request.POST.has_key('sourceIp'):
        sourceIp = request.POST['sourceIp']
        targetIp = request.POST['targetIp']
        sourcePortIp = request.POST['sourcePortIp']
        targetPortIp = request.POST['targetPortIp']
        sourceIface = request.POST['sourceIface']
        targetIface = request.POST['targetIface']
        sourcePw = request.POST['sourcePw']
        targetPw = request.POST['targetPw']

        print "Configuring interfaces for " + str(sourceIp)
        try:
            sourceResults =  ju.setInterfaceIpAddress(sourceIp, sourcePw, sourceIface, sourcePortIp)

            if sourceResults == False:
                raise wistarException("Couldn't set ip address on source VM")
            targetResults =  ju.setInterfaceIpAddress(targetIp, targetPw, targetIface, targetPortIp)
            if targetResults == False:
                raise wistarException("Couldn't set ip address on target VM")

            response_data["result"] = "Success"
            print str(response_data)
            return HttpResponse(json.dumps(response_data), content_type="application/json")
        except wistarException as we:
            print we
            response_data["result"] = False
            response_data["message"] = str(we)
            return HttpResponse(json.dumps(response_data), content_type="application/json")
    else:
        response_data["result"] = False
        response_data["message"] = "Invalid POST"
        return HttpResponse(json.dumps(response_data), content_type="application/json")
   
@csrf_exempt
def refreshDeploymentStatus(request):
    response_data = {}
    if request.POST.has_key('topologyId'):
        topologyId = request.POST['topologyId']
        domain_list = lu.getDomainsForTopology("t" + topologyId)
        network_list = []
        if ou.checkIsLinux():
            network_list = lu.getNetworksForTopology("t" + topologyId)

        context = {'domain_list': domain_list, 'network_list' : network_list }
        return render(request, 'ajax/deploymentStatus.html', context)
    else:
        return render(request, 'ajax/ajaxError.html', "Error in refreshDeploymentStatus")


@csrf_exempt
def manageDomain(request):
    response_data = {}
    requiredFields = set([ 'domainId', 'action', 'topologyId' ])
    if not requiredFields.issubset(request.POST):
        return render(request, 'ajax/ajaxError.html', { 'error' : "Invalid Parameters in POST" } )
   
    domainId = request.POST['domainId'] 
    action = request.POST['action'] 
    topologyId = request.POST['topologyId'] 

    if action == "start": 
        ret = lu.startDomain(domainId)
        if ret == True:
            return refreshDeploymentStatus(request)
        else:
            return render(request, 'ajax/ajaxError.html', { 'error' : "Could not start domain!" } )

    elif action == "stop":
        ret = lu.stopDomain(domainId)
        if ret == True:
            return refreshDeploymentStatus(request)
        else:
            return render(request, 'ajax/ajaxError.html', { 'error' : "Could not stop domain!" } )

    elif action == "undefine":
        sourceFile = lu.getImageForDomain(domainId)
        ret = lu.undefineDomain(domainId)
        if ret == True:
            if sourceFile is not None:
                ou.removeInstance(sourceFile)
            return refreshDeploymentStatus(request)
        else:
            return render(request, 'ajax/ajaxError.html', { 'error' : "Could not stop domain!" } )
    else:
            return render(request, 'ajax/ajaxError.html', { 'error' : "Unknown Parameters in POST!" } )

@csrf_exempt
def deployTopology(request):
    response_data = {}
    if not request.POST.has_key('topologyId'):
        return render(request, 'ajax/ajaxError.html', { 'error' : "No Topology Id in request" })
    
    topologyId = request.POST['topologyId']
    topo = {}
    try:
        topo  = Topology.objects.get(pk=topologyId)
    except Exception as ex:
        print ex
        return render(request, 'ajax/ajaxError.html', { 'error' : "Topology not found!" })

    # let's parse the json and convert to simple lists and dicts
    config = wu.loadJson(topo.json, topologyId)
    time.sleep(1)

    # only create networks on Linux/KVM

    print "Checking if we should create networks first!"
    if ou.checkIsLinux():
        for network in config["networks"]:
            try:
                if not lu.networkExists(network["name"]):
                    if debug:
                        print "Rendering networkXml for: " + network["name"]
                    networkXml = render_to_string("ajax/kvm/network.xml", {'network' : network})
                    print networkXml
                    n = lu.defineNetworkFromXml(networkXml)
                    if n == False:
                        err_msg = "Error defining network: " + network["name"]
                        context = {'error' : err_msg }
                        return render(request, 'ajax/ajaxError.html', context)

                print "Starting network"
                lu.startNetwork(network["name"])
            except:
                err_msg = "Error starting network: " + network["name"]
                context = {'error' : err_msg }
                return render(request, 'ajax/ajaxError.html', context)

    time.sleep(1)   
    for device in config["devices"]:
        try:
            if not lu.domainExists(device["name"]):
                if debug:
                    print "Rendering deviceXml for: " + device["name"]

                image = Image.objects.get(pk=device["imageId"])

                # fixme - simplify this logic to return just the deviceXml based on
                # image.type and host os type (ou.checkIsLinux)
                imageBasePath = settings.MEDIA_ROOT + "/" + image.filePath.url
                instancePath = ou.getInstancePathFromImage(imageBasePath, device["name"])

                # by default, we use kvm as the hypervisor
                domainXmlPath = "ajax/kvm/"
                if not ou.checkIsLinux():
                    # if we're not on Linux, then let's try to use vbox instead
                    domainXmlPath = "ajax/vbox/" 

                print "rendering xml for image type: " + str(image.type)
                if image.type == "junos_firefly":
                    print "Using firefly definition"
                    deviceXml = render_to_string(domainXmlPath + "domain_firefly.xml", {'device' : device, 'instancePath' : instancePath})
                else:
                    deviceXml = render_to_string(domainXmlPath + "domain.xml", {'device' : device, 'instancePath' : instancePath})

                if debug:
                    print "Checking that image instance exists at " + str(instancePath)

                if ou.checkImageInstance(imageBasePath, device["name"]):
                    print "Image Instance already exists"
                else:
                    print "Image Instance does not exist"
                    if ou.createThinProvisionInstance(imageBasePath, device["name"]):
                        print "Successly created instance"
                    else:
                        context = {'error' : 'Could not create image instance for image: ' + imageBasePath }
                        return render(request, 'ajax/ajaxError.html', context)

                if debug:
                    print "Defining domain"
                d = lu.defineDomainFromXml(deviceXml)
                if d == False:
                    err_msg = "Error defining Instance: " + device["name"]
                    context = {'error' : err_msg }
                    return render(request, 'ajax/ajaxError.html', context)

            if not ou.checkIsLinux():
                # perform some special hacks for vbox
                vu.preconfigureVMX(device["name"])

            #print "Starting domain! " + device["name"]
            #lu.startDomainByName(device["name"])
        except Exception as ex:
            print ex
            err_msg = "Error starting Instance: " + device["name"]
            context = {'error' : err_msg }
            return render(request, 'ajax/ajaxError.html', context)

    domain_list = lu.getDomainsForTopology("t" + topologyId)
    network_list = []
    if ou.checkIsLinux():
        network_list = lu.getNetworksForTopology("t" + topologyId)
    context = {'domain_list': domain_list, 'network_list' : network_list }
    return render(request, 'ajax/deploymentStatus.html', context)
