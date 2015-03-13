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
from topologies.models import ConfigSet
from topologies.models import Config
# import logging
import time
import json

# FIXME = debug should be a global setting
debug = True

def index(request):
    return HttpResponseRedirect('/topologies/')

def manageHypervisor(request):
    return render(request, 'ajax/manageHypervisor.html')

def viewDomain(request, domain_id):
    domain = lu.getDomainByUUID(domain_id)
    return render(request, 'ajax/viewDomain.html', {'domain': domain, 'xml' : domain.XMLDesc(0)})

def viewNetwork(request, network_name):
    network = lu.getNetworkByName(network_name)
    return render(request, 'ajax/viewNetwork.html', {'network': network, 'xml' : network.XMLDesc(0)})

# fixme - remove need for csrf_exempt!
@csrf_exempt
def preconfigJunosDomain(request):
    response_data = {}
    requiredFields = set([ 'domain', 'password', 'ip', 'mgmtInterface' ])
    if not requiredFields.issubset(request.POST):
        return render(request, 'ajax/ajaxError.html', { 'error' : "Invalid Parameters in POST" } )

    domain = request.POST['domain']
    password = request.POST['password']
    ip = request.POST['ip']
    mgmtInterface = request.POST['mgmtInterface']
    
    print "Configuring domain:" + str(domain)
    try:

        # let's see if we need to kill any webConsole sessions first
        webConsoleDict = request.session.get("webConsoleDict")
        if webConsoleDict is not None:
            if webConsoleDict.has_key(domain):
                wsConfig = webConsoleDict[domain]
                wsPort = wsConfig["wsPort"]
                server = request.get_host().split(":")[0]
                wu.killWebSocket(server, wsPort)

        # FIXME - there is a bug somewhere that this can be blank ?
        if mgmtInterface == "":
            mgmtInterface = "em0"
        elif mgmtInterface == "em0":
            if not ou.checkIsLinux():
                mgmtInterface = "fxp0"
        
        response_data["result"] = cu.preconfigJunosDomain(domain, password, ip, mgmtInterface)
        print str(response_data)
        return HttpResponse(json.dumps(response_data), content_type="application/json")
    except wistarException as we:
        print we
        response_data["result"] = False
        response_data["message"] = str(we)
        return HttpResponse(json.dumps(response_data), content_type="application/json")

@csrf_exempt
def preconfigFirefly(request):
    response_data = {}
    requiredFields = set([ 'domain', 'password', 'mgmtInterface' ])
    if not requiredFields.issubset(request.POST):
        return render(request, 'ajax/ajaxError.html', { 'error' : "Invalid Parameters in POST" } )

    domain = request.POST['domain']
    password = request.POST['password']
    mgmtInterface = request.POST['mgmtInterface']
    
    print "Configuring Firefly management zones:" + str(domain)
    try:

        # let's see if we need to kill any webConsole sessions first
        webConsoleDict = request.session.get("webConsoleDict")
        if webConsoleDict is not None:
            if webConsoleDict.has_key(domain):
                wsConfig = webConsoleDict[domain]
                wsPort = wsConfig["wsPort"]
                server = request.get_host().split(":")[0]
                wu.killWebSocket(server, wsPort)

        response_data["result"] = cu.preconfigFirefly(domain, password, mgmtInterface)
        return HttpResponse(json.dumps(response_data), content_type="application/json")
    except wistarException as we:
        print we
        response_data["result"] = False
        response_data["message"] = str(we)
        return HttpResponse(json.dumps(response_data), content_type="application/json")

@csrf_exempt
def configJunosInterfaces(request):
    response_data = {}
    requiredFields = set([ 'password', 'ip' ])
    if not requiredFields.issubset(request.POST):
        return render(request, 'ajax/ajaxError.html', { 'error' : "Invalid Parameters in POST" } )

    ip = request.POST['ip']
    password = request.POST['password']
    print "Configuring interfaces for " + str(ip)
    try:
        response_data["result"] = ju.configJunosInterfaces(ip, password)
        return HttpResponse(json.dumps(response_data), content_type="application/json")
    except wistarException as we:
        print we
        response_data["result"] = False
        response_data["message"] = str(we)
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
    requiredFields = set([ 'name' ])
    if not requiredFields.issubset(request.POST):
        return render(request, 'ajax/ajaxError.html', { 'error' : "Invalid Parameters in POST" } )

    name = request.POST['name']
    response_data["result"] = cu.isJunosDeviceAtPrompt(name)
    return HttpResponse(json.dumps(response_data), content_type="application/json")

@csrf_exempt
def getJunosConfig(request):
    response_data = {}
    requiredFields = set([ 'ip', 'password' ])
    if not requiredFields.issubset(request.POST):
        return render(request, 'ajax/ajaxError.html', { 'error' : "Invalid Parameters in POST" } )

    ip = request.POST['ip']
    password = request.POST['password']
    print "Getting Config for " + str(ip)
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


@csrf_exempt
def syncLinkData(request):
    response_data = {}
    requiredFields = set([ 'sourceIp', 'targetIp', 'sourcePortIp', 'targetPortIp', 'sourceIface', 'targetIface', 'sourcePw', 'targetPw' ])
    if not requiredFields.issubset(request.POST):
        return render(request, 'ajax/ajaxError.html', { 'error' : "Invalid Parameters in POST" } )
    
    sourceIp = request.POST['sourceIp']
    targetIp = request.POST['targetIp']
    sourcePortIp = request.POST['sourcePortIp']
    targetPortIp = request.POST['targetPortIp']
    sourceIface = request.POST['sourceIface']
    targetIface = request.POST['targetIface']
    sourcePw = request.POST['sourcePw']
    targetPw = request.POST['targetPw']

    try:
        if sourceIp != "0.0.0.0":
            print "Configuring interfaces for " + str(sourceIp)
            sourceResults =  ju.setInterfaceIpAddress(sourceIp, sourcePw, sourceIface, sourcePortIp)

            if sourceResults == False:
                raise wistarException("Couldn't set ip address on source VM")
        
        if targetIp != "0.0.0.0":
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
   
@csrf_exempt
def refreshDeploymentStatus(request):
    response_data = {}
    requiredFields = set([ 'topologyId' ])
    if not requiredFields.issubset(request.POST):
        return render(request, 'ajax/ajaxError.html', { 'error' : "Invalid Parameters in POST" } )
    
    topologyId = request.POST['topologyId']


    if topologyId == "":
        print "Found a blank topoId, returing full hypervisor status"
        return refreshHypervisorStatus(request)

    domain_list = lu.getDomainsForTopology("t" + topologyId)
    network_list = []
    isLinux = False
    if ou.checkIsLinux():
        isLinux = True
        network_list = lu.getNetworksForTopology("t" + topologyId)

    context = {'domain_list': domain_list, 'network_list' : network_list, 'topologyId' : topologyId, 'isLinux' : isLinux }
    return render(request, 'ajax/deploymentStatus.html', context)

@csrf_exempt
def refreshHypervisorStatus(request):
    domains = lu.listDomains()
    if ou.checkIsLinux():
        networks = lu.listNetworks()
    else:
        networks = []

    context = {'domain_list': domains, 'network_list' : networks }
    return render(request, 'ajax/deploymentStatus.html', context )

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
        if lu.startDomain(domainId):
            return refreshDeploymentStatus(request)
        else:
            return render(request, 'ajax/ajaxError.html', { 'error' : "Could not start domain!" } )

    elif action == "stop":
        if lu.stopDomain(domainId):
            return refreshDeploymentStatus(request)
        else:
            return render(request, 'ajax/ajaxError.html', { 'error' : "Could not stop domain!" } )

    elif action == "undefine":
        sourceFile = lu.getImageForDomain(domainId)
        if lu.undefineDomain(domainId):
            if sourceFile is not None:
                ou.removeInstance(sourceFile)
            return refreshDeploymentStatus(request)
        else:
            return render(request, 'ajax/ajaxError.html', { 'error' : "Could not stop domain!" } )
    else:
            return render(request, 'ajax/ajaxError.html', { 'error' : "Unknown Parameters in POST!" } )

@csrf_exempt
def manageNetwork(request):
    response_data = {}
    requiredFields = set([ 'networkName', 'action', 'topologyId' ])
    if not requiredFields.issubset(request.POST):
        return render(request, 'ajax/ajaxError.html', { 'error' : "Invalid Parameters in POST" } )

    networkName = request.POST['networkName'] 
    action = request.POST['action'] 
    topologyId = request.POST['topologyId'] 

    if action == "start": 
        if lu.startNetwork(networkName):
            return refreshDeploymentStatus(request)
        else:
            return render(request, 'ajax/ajaxError.html', { 'error' : "Could not start network!" } )
    elif action == "stop":
        if lu.stopNetwork(networkName):
            return refreshDeploymentStatus(request)
        else:
            return render(request, 'ajax/ajaxError.html', { 'error' : "Could not stop network!" } )

    elif action == "undefine":
        if lu.undefineNetwork(networkName):
            return refreshDeploymentStatus(request)
        else:
            return render(request, 'ajax/ajaxError.html', { 'error' : "Could not stop domain!" } )
    else:
            return render(request, 'ajax/ajaxError.html', { 'error' : "Unknown Parameters in POST!" } )

@csrf_exempt
def pushConfigSet(request):
    print "Pushing ConfigSet"
    response_data = {}
    response_data["result"] = True

    requiredFields = set([ 'id' ])
    if not requiredFields.issubset(request.POST):
        return render(request, 'ajax/ajaxError.html', { 'error' : "Invalid Parameters in POST" } )

    configSetId = request.POST['id'] 

    print "csid is " + configSetId

    cs = ConfigSet.objects.get(pk=configSetId)

    print "Got cs"
    topo = cs.topology

    configs = Config.objects.filter(configSet=cs)

    for config in configs:
        print config.ip
        try:
            ju.pushConfigString(config.deviceConfig, config.ip, config.password)
        except Exception as e:
            print "Could not reload config on " + str(config.ip)
            response_data["message"] = response_data["message"] + " Error pushing to " + str(config.ip)
            print e

    return HttpResponse(json.dumps(response_data), content_type="application/json")

@csrf_exempt
def deleteConfigSet(request):
    print "Deleting ConfigSet"
    response_data = {}
    response_data["result"] = True

    requiredFields = set([ 'id' ])
    if not requiredFields.issubset(request.POST):
        return render(request, 'ajax/ajaxError.html', { 'error' : "Invalid Parameters in POST" } )

    configSetId = request.POST['id']
    cs = ConfigSet.objects.get(pk=configSetId)
    cs.delete()
    
    return HttpResponse(json.dumps(response_data), content_type="application/json")

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
                    print deviceXml

                d = lu.defineDomainFromXml(deviceXml)
                if d == False:
                    err_msg = "Error defining Instance: " + device["name"]
                    context = {'error' : err_msg }
                    return render(request, 'ajax/ajaxError.html', context)

            if not ou.checkIsLinux():
                # perform some special hacks for vbox
                dev_mgmt_ifaces = device["managementInterfaces"]
                mgmt_ip_addr = str(dev_mgmt_ifaces[0]["ip"])
                vu.preconfigureVMX(device["name"], mgmt_ip_addr)
                # vu.preconfigureVMX(device["name"])

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
    context = {'domain_list': domain_list, 'network_list' : network_list, 'isLinux' : True, 'topologyId' : topologyId }
    return render(request, 'ajax/deploymentStatus.html', context)


@csrf_exempt
def launchWebConsole(request):
    print "Let's launch a console!"

    requiredFields = set([ 'domain' ])
    if not requiredFields.issubset(request.POST):
        return render(request, 'ajax/ajaxError.html', { 'error' : "Invalid Parameters in POST" } )

    response_data = {}
    domain = request.POST["domain"]
    print "Got domain of: " + domain
    # this keeps a list of used ports around for us
    webConsoleDict = request.session.get("webConsoleDict")

    # server = request.META["SERVER_NAME"]
    server = request.get_host().split(":")[0]

    print webConsoleDict
    if webConsoleDict is None:
        print "no previous webConsoles Found!"
        webConsoleDict = {}
        request.session["webConsoleDict"] = webConsoleDict

    print "OK, do we have this domain?"
    if webConsoleDict.has_key(domain):
        print "yep"
        wsConfig = webConsoleDict[domain]
        pid = wsConfig["pid"]
        wsPort = wsConfig["wsPort"]
        vncPort = wsConfig["vncPort"]

        if wu.checkWebSocket(server, wsPort):
            print "This websocket is already running"
            response_data["result"] = True
            response_data["message"] = "already running on port: " + wsPort
            response_data["port"] = wsPort
            return HttpResponse(json.dumps(response_data), content_type="application/json")
        else:
            pid = wu.launchWebSocket(wsPort, vncPort, server)
            if pid is not None:
                wsConfig["pid"] = pid
                response_data["result"] = True
                response_data["message"] = "started webconsole on port: " + wsPort
                response_data["port"] = wsPort
                return HttpResponse(json.dumps(response_data), content_type="application/json")
            else:
                response_data["result"] = False
                response_data["message"] = "Could not start webConsole"
                return HttpResponse(json.dumps(response_data), content_type="application/json")
    else:
        print "nope"
        # start the ws ports at 6900
        wsPort = len(webConsoleDict.keys()) + 6900

        print "using wsPort of " + str(wsPort)
        # get the domain from the hypervisor
        d = lu.getDomainByName(domain)
        # now grab the configured vncport
        vncPort = lu.getDomainVncPort(d)

        print "Got VNC port " + str(vncPort)
        pid = wu.launchWebSocket(wsPort, vncPort, server)

        print "what happend? " + str(pid)
        if pid is None:
            print "oh no"
            response_data["result"] = False
            response_data["message"] = "Could not start webConsole"
            print "returning"
            return HttpResponse(json.dumps(response_data), content_type="application/json")

        print "Launched with pid " + str(pid)
        wcConfig = {}
        wcConfig["pid"] = str(pid)
        wcConfig["vncPort"] = str(vncPort)
        wcConfig["wsPort"] = str(wsPort)
      
        webConsoleDict[domain] = wcConfig 
        request.session["webConsoleDict"] = webConsoleDict
        response_data["result"] = True
        response_data["message"] = "started webconsole on port: " + str(wsPort)
        response_data["port"] = wsPort
        return HttpResponse(json.dumps(response_data), content_type="application/json")
