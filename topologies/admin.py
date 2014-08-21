from django.contrib import admin

from topologies.models import Lab
from topologies.models import Topology
from topologies.models import Device

admin.site.register(Lab)
admin.site.register(Topology)
admin.site.register(Device)
