from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponseRedirect, HttpResponse
from common.lib.wistarException import wistarException
import common.lib.wistarUtils as wu
import common.lib.libvirtUtils as lu
import common.lib.junosUtils as ju
import common.lib.consoleUtils as cu
import common.lib.osUtils as ou
import common.lib.vboxUtils as vu
from images.models import Image
# import logging
# import time
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
   
