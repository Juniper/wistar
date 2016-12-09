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

from api import views

urlpatterns = [
    url(r'^getTopologyStatus/$', views.get_topology_status, name='get_topology_status'),
    url(r'^startTopology/$', views.start_topology, name='start_topology'),
    url(r'^importTopology/$', views.import_topology_json, name='import_topology_json'),
    url(r'^checkTopology/$', views.check_topology_exists, name='check_topology'),
    url(r'^exportTopology/$', views.export_topology_json, name='export_topology'),
    url(r'^checkImage/$', views.check_image_exists, name='check_image'),
    url(r'^createImage/$', views.create_local_image, name='create_image'),
    url(r'^deleteImage/$', views.delete_image, name='delete_image'),
    url(r'^configureTopology/$', views.configure_topology, name='configure_topology'),
    url(r'^ansibleInventory/$', views.get_topology_inventory, name='topology_inventory'),
]
