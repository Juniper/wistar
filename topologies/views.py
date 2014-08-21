from django.shortcuts import render, get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.template.loader import render_to_string
from django.http import HttpResponseRedirect, HttpResponse
from topologies.models import Topology
from topologies.lib.wistarException import wistarException
import topologies.lib.wistarUtils as wu
import topologies.lib.libvirtUtils as lu
import topologies.lib.junosUtils as ju
import topologies.lib.consoleUtils as cu
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
	return render(request, 'edit.html')

def detail(request, topo_id):
	topo  = get_object_or_404(Topology, pk=topo_id)
	return render(request, 'edit.html', {'topo': topo})

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
	config = wu.loadJson(topo.json)
	return render(request, 'kvmCreateScript.html', {'topo': topo, 'config' : config})

# take the topology id and deploy to the local machine using python libvirt
def deploy(request, topo_id):
	topo  = get_object_or_404(Topology, pk=topo_id)
	# let's parse the json and convert to simple lists and dicts
	config = wu.loadJson(topo.json)
	if debug:
		print "Resetting kvm"
	lu.resetKvm()
	time.sleep(1)
	for network in config["networks"]:
		if debug:
			print "Rendoring networkXml for: " + network["name"]
		networkXml = render_to_string("kvm/network.xml", {'network' : network})
		if debug:
			print "Defining domain"
		n = lu.defineNetworkFromXml(networkXml)
		if n == False:
			return render(request, "error.html")
	
	time.sleep(1)	
	for device in config["devices"]:
		if debug:
			print "Rendoring deviceXml for: " + device["name"]
		deviceXml = render_to_string("kvm/domain.xml", {'device' : device})
		if debug:
			print "Defining domain"
		d = lu.defineDomainFromXml(deviceXml)
		if d == False:
			return render(request, "error.html")
	
	return HttpResponseRedirect('/topologies/manageKvm')

def manageKvm(request):
	domains = lu.listDomains()
	networks = lu.listNetworks()
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

# FIXME - add the csrf stuff in the ajax calls!
@csrf_exempt
def preconfigJunosDomain(request):
	response_data = {}
	if request.POST.has_key('domain'):
		domain = request.POST['domain']
		if not lu.domainExists(domain):
			print "Domain not defined!"
			response_data["result"] = False
			response_data["message"] = "Domain is not defined!"
			return HttpResponse(json.dumps(response_data), content_type="application/json")

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
        	# Redisplay the poll voting form.
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


