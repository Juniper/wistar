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

from ajax import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^configJunosInterfaces/$', views.config_junos_interfaces, name='configJunosInterfaces'),
    url(r'^preconfigJunosDomain/$', views.preconfig_junos_domain, name='preconfigJunosDomain'),
    url(r'^preconfigFirefly/$', views.preconfig_firefly, name='preconfigFirefly'),
    url(r'^preconfigLinuxDomain/$', views.preconfig_linux_domain, name='preconfigLinuxDomain'),
    url(r'^getJunosConfig/$', views.get_junos_config, name='getJunosConfig'),
    url(r'^getConfigTemplates/$', views.get_config_templates, name='getConfigTemplates'),
    url(r'^getAvailableInstances/$', views.get_available_instances, name='getAvailableInstances'),
    url(r'^applyConfigTemplate/$', views.apply_config_template, name='applyConfigTemplate'),
    url(r'^applyJunosSetConfig/$', views.apply_junos_set_config, name='applyJunosSetConfig'),
    url(r'^getJunosStartupState/$', views.get_junos_startup_state, name='getJunosStartupState'),
    url(r'^getLinuxStartupState/$', views.get_linux_startup_state, name='getLinuxStartupState'),
    url(r'^syncLinkData/$', views.sync_link_data, name='syncLinkData'),
    url(r'^refreshDeploymentStatus/$', views.refresh_deployment_status,  name='refreshDeploymentStatus'),
    url(r'^refreshHypervisorStatus/$', views.refresh_hypervisor_status, name='refreshHypervisorStatus'),
    url(r'^refreshHostLoad/$', views.refresh_host_load, name='refreshHostLoad'),
    url(r'^multiCloneTopology/$', views.multi_clone_topology, name='multiCloneTopology'),
    url(r'^deployTopology/$', views.deploy_topology, name='deployTopology'),
    url(r'^redeployTopology/$', views.redeploy_topology, name='redeployTopology'),
    url(r'^deployStack/(?P<topology_id>[^/]+)$', views.deploy_stack, name='deployStack'),
    url(r'^deleteStack/(?P<topology_id>[^/]+)$', views.delete_stack, name='deleteStack'),
    url(r'^startTopology/$', views.start_topology, name='startTopology'),
    url(r'^pauseTopology/$', views.pause_topology, name='pauseTopology'),
    url(r'^manageDomain/$', views.manage_domain, name='manageDomain'),
    url(r'^manageNetwork/$', views.manage_network, name='manageNetwork'),
    url(r'^manageHypervisor/$', views.manage_hypervisor, name='manage_hypervisor'),
    url(r'^executeCli/$', views.execute_cli, name='executeCli'),
    url(r'^executeLinuxCli/$', views.execute_linux_cli, name='executeLinuxCli'),
    url(r'^launchWebConsole/$', views.launch_web_console, name='launchWebConsole'),
    url(r'^pushConfigSet/$', views.push_config_set, name='pushConfigSet'),
    url(r'^deleteConfigSet/$', views.delete_config_set, name='deleteConfigSet'),
    url(r'^viewNetwork/(?P<network_name>[^/]+)$', views.view_network, name='viewNetwork'),
    url(r'^viewDomain/(?P<domain_id>[^/]+)$', views.view_domain, name='viewDomain'),
    url(r'^checkIp/$', views.check_ip, name='check_ip'),
    url(r'^nextIp/$', views.get_available_ip, name='get_available_ip'),
    url(r'^executeLinuxAutomation/$', views.execute_linux_automation, name='execute_linux_automation'),
    url(r'^executeJunosAutomation/$', views.execute_junos_automation, name='execute_junos_automation'),
    url(r'^getScripts/$', views.get_scripts, name='get_scripts'),
    url(r'^pushScript/$', views.push_script, name='push_script'),
    url(r'^launchScript/$', views.launch_script, name='launch_script'),
    url(r'^manageIso/$', views.manage_iso, name='manage_iso'),
    url(r'^listIso/$', views.list_isos, name='list_isos'),
]
