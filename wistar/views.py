from django.shortcuts import render, get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.template.loader import render_to_string
from django.http import HttpResponseRedirect, HttpResponse

def index(request):
    print "Redirecting to /topologies"
    return HttpResponseRedirect('/topologies/')

