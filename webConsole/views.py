from django.shortcuts import render

def index(request):
    return render(request, 'webConsole/vnc.html')

def console(request, port):
    context = {}
    context["port"] = port
    context["server"] = request.get_host().split(":")[0]

    wc = request.session["webConsoleDict"]
    for d in wc.keys():
        if wc[d]["wsPort"] == port:
            domain = d
            continue

    context["title"] = domain
    return render(request, 'webConsole/vnc.html', context)
