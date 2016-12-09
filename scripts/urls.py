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

from scripts import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^new/$', views.new_template, name='new'),
    url(r'^newScript/$', views.new_script, name='new_script'),
    url(r'^createScript/$', views.create_script, name='create_script'),
    url(r'^viewScript/(?P<script_id>\d+)/$', views.view_script, name='view_script'),
    url(r'^deleteScript/(?P<script_id>\d+)/$', views.delete_script, name='delete_script'),
    url(r'^editScript/(?P<script_id>\d+)/$', views.edit_script, name='edit_script'),
    url(r'^updateScript/$', views.update_script, name='update_script'),
    url(r'^create/$', views.create, name='create'),
    url(r'^update/$', views.update, name='update'),
    url(r'^error/$', views.error, name='error'),
    url(r'^delete/(?P<template_id>\d+)/$', views.delete, name='delete'),
    url(r'^(?P<template_id>\d+)$', views.detail, name='detail'),
    url(r'^edit/(?P<template_id>\d+)/$', views.edit, name='edit'),
]
