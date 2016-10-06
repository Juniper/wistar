from django.http import HttpResponseRedirect


def index(request):
    print "Redirecting to /topologies"
    return HttpResponseRedirect('/topologies/')

