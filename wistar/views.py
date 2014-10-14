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
    print "Redirecting to /topologies"
    return HttpResponseRedirect('/topologies/')

