#
# DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS FILE HEADER
#
# Copyright (c) 2015 Juniper Networks, Inc.
# All rights reserved.
#
# Use is subject to license terms.
#
# Licensed under the Apache License, Version 2.0 (the ?License?); you may not
# use this file except in compliance with the License. You may obtain a copy of
# the License at http://www.apache.org/licenses/LICENSE-2.0.
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

from django.conf.urls import url

from topologies import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^edit/$', views.edit, name='edit'),
    url(r'^new/$', views.new, name='new'),
    url(r'^create/$', views.create, name='create'),
    url(r'^export/(?P<topo_id>\d+)/$', views.export_topology, name='exportTopology'),
    url(r'^import/$', views.import_topology, name='importTopology'),
    url(r'^error/$', views.error, name='error'),
    url(r'^clone/(?P<topo_id>\d+)/$', views.clone, name='clone'),
    url(r'^createConfigSet/$', views.create_config_set, name='createConfigSet'),
    url(r'^delete/(?P<topology_id>\d+)/$', views.delete, name='delete'),
    url(r'^(?P<topo_id>\d+)/$', views.detail, name='detail'),
    url(r'^launch/(?P<topology_id>\d+)$', views.launch, name='launch'),
    url(r'^parent/(?P<domain_name>[^/]+)$', views.parent, name='parent'),
    url(r'^exportHeat/(?P<topology_id>\d+)$', views.export_as_heat_template, name='exportHeat'),
    url(r'^addInstanceForm/$', views.add_instance_form, name='add_instance_form'),

]
