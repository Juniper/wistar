from django.contrib import admin

from topologies.models import ConfigSet
from topologies.models import Topology
from topologies.models import Config

admin.site.register(ConfigSet)
admin.site.register(Topology)
admin.site.register(Config)
