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

from images import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^new/$', views.new, name='new'),
    url(r'^blank/$', views.blank, name='blank'),
    url(r'^local/$', views.local, name='local'),
    url(r'^create/$', views.create, name='create'),
    url(r'^createBlank/$', views.create_blank, name='create_blank'),
    url(r'^createLocal/$', views.create_local, name='create_local'),
    url(r'^blockPull/(?P<uuid>[^/]+)$', views.block_pull,
        name='block_pull'),
    url(r'^createFromInstance/(?P<uuid>[^/]+)$', views.create_from_instance,
        name='create_from_instance'),
    url(r'^update/$', views.update, name='update'),
    url(r'^edit/(?P<image_id>\d+)/$', views.edit, name='edit'),
    url(r'^error/$', views.error, name='error'),
    url(r'^delete/(?P<image_id>\d+)/$', views.delete, name='delete'),
    url(r'^(?P<image_id>\d+)$', views.detail, name='detail'),
    url(r'^glance$', views.list_glance_images, name='glance'),
    url(r'^glanceDetail$', views.glance_detail, name='glance_detail'),
    url(r'^glanceImages/$', views.glance_list, name='glance_list'),
    url(r'^uploadToGlance/(?P<image_id>\d+)/$', views.upload_to_glance, name='upload'),
    url(r'^importFromGlance/(?P<glance_id>[^/]+)/$', views.import_from_glance, name='glance_import'),
]

