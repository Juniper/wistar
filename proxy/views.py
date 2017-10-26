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

import logging
import time

from django.shortcuts import render

from common.lib import osUtils
from common.lib import wistarUtils

logger = logging.getLogger(__name__)


def index(request):
    pass


def proxies_for_ip(request):
    logger.info('---------proxies_for_ip--------')
    required_fields = set(['remote_ip'])
    if not required_fields.issubset(request.POST):
        return render(request, 'ajax/overlayError.html', {'error': "Invalid Parameters in POST"})

    remote_ip = request.POST['remote_ip']

    active_proxies = osUtils.get_active_proxies()
    proxies = list()
    for p in active_proxies:
        if p['remote_ip'] == remote_ip:
            proxies.append(p)

    context = {'proxies': proxies, 'remote_ip': remote_ip}
    return render(request, 'proxy/proxies_for_ip.html', context)


def launch_proxy(request):
    logger.info('---------launch_proxy--------')
    required_fields = set(['remote_ip', 'remote_port', 'local_port'])
    if not required_fields.issubset(request.POST):
        return render(request, 'ajax/overlayError.html', {'error': "Invalid Parameters in POST"})

    remote_ip = request.POST['remote_ip']
    remote_port = request.POST['remote_port']
    local_port = request.POST['local_port']
    if osUtils.check_port_in_use(local_port):
        return render(request, 'ajax/overlayError.html', {'error': "Port %s is already in use" % local_port})

    pid = wistarUtils.launch_proxy(local_port, remote_port, remote_ip)
    logger.info('launched proxy with pid: %s' % pid)
    time.sleep(1)

    active_proxies = osUtils.get_active_proxies()
    proxies = list()
    for p in active_proxies:
        if p['remote_ip'] == remote_ip:
            proxies.append(p)

    context = {'proxies': proxies, 'remote_ip': remote_ip}
    return render(request, 'proxy/proxies_for_ip.html', context)


def terminate_proxy(request):
    logger.info('---------terminate_proxy--------')
    required_fields = set(['proxy_id'])
    if not required_fields.issubset(request.POST):
        return render(request, 'ajax/overlayError.html', {'error': "Invalid Parameters in POST"})

    proxy_id = request.POST['proxy_id']

    active_proxies = osUtils.get_active_proxies()
    remote_ip = None
    for p in active_proxies:
        if p['pid'] == proxy_id:
            remote_ip = p['remote_ip']
            o = osUtils.kill_pid(proxy_id)
            logger.debug('killed proxy id: %s' % proxy_id)
            time.sleep(1)

    if remote_ip is None:
        return render(request, 'ajax/overlayError.html', {'error': "proxy id %s was not found!" % proxy_id})

    active_proxies = osUtils.get_active_proxies()
    proxies = list()
    for p in active_proxies:
        if p['remote_ip'] == remote_ip:
            proxies.append(p)

    context = {'proxies': proxies, 'remote_ip': remote_ip}
    return render(request, 'proxy/proxies_for_ip.html', context)