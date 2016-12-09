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

from django.db import models


class Topology(models.Model):
    description = models.TextField(default="none", verbose_name="Description")
    name = models.TextField(default="noname", verbose_name="name")
    json = models.TextField(verbose_name="json")
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(verbose_name="modified", auto_now=True)

    class Meta:
        verbose_name = 'Topology'
        verbose_name_plural = 'topologies'


class ConfigSet(models.Model):
    topology = models.ForeignKey('Topology')
    name = models.TextField()
    description = models.TextField()
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'ConfigSet'
        verbose_name_plural = 'configSets'


class Config(models.Model):
    configSet = models.ForeignKey('ConfigSet')
    name = models.TextField()
    type = models.TextField()
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)
    ip = models.GenericIPAddressField()
    deviceConfig = models.TextField()
    password = models.TextField()
    
    class Meta:
        verbose_name = 'Config'
        verbose_name_plural = 'configs'

