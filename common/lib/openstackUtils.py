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

import json
import logging
import mmap
import time
import urllib2
from urllib2 import URLError

from wistar import configuration

# OpenStack component URLs
# _glance_url = ':9292/v1'
_analytics_url = ':8081'
_api_url = ':8082'
_os_url = ':5000/v3'
_nova_url = ':8774/v2'
_neutron_url = ':9696/v2.0'
_glance_url = ':9292/v2'
_heat_url = ':8004/v1'
_auth_url = _os_url + "/auth/tokens"
_data_url = ':8143/api/tenant/networking/'

# auth token will get populated by connect on each instantiation
# and referenced by each subsequent call
_auth_token = ""
_project_auth_token = ""
_tenant_id = ""

_token_cache_time = time.time()
_project_token_cache_time = time.time()

# cache auth tokens for 1 hour
_max_cache_time = 3600

logger = logging.getLogger(__name__)


def connect_to_openstack():
    """
    authenticates to keystone at configuration.openstack_host with OPENSTACK_USER, OPENSTACK_PASS
    will set the _auth_token property on success, which is then used for all subsequent
    calls from this module
    :return: True on successful authentication to keystone, False otherwise
    """

    logger.debug("--- connect_to_openstack ---")

    logger.debug('verify configuration')

    if not hasattr(configuration, 'openstack_host'):
        logger.error('Openstack Host is not configured')
        return False

    if not hasattr(configuration, 'openstack_user'):
        logger.error('Openstack User is not configured')
        return False

    if not hasattr(configuration, 'openstack_password'):
        logger.error('Openstack Password is not configured')
        return False

    global _auth_token
    global _tenant_id
    global _token_cache_time

    # simple cache calculation
    # _token_cache_time will get updated when we refresh the token
    # so let's find out how long ago that was
    # and if we should refresh again
    now = time.time()
    diff = now - _token_cache_time

    if diff < _max_cache_time and _auth_token != "":
        return _auth_token

    logger.debug("refreshing auth token")
    _token_cache_time = now
    _auth_token = ""

    _auth_json = """
        { "auth": {
            "identity": {
              "methods": ["password"],
              "password": {
                "user": {
                  "name": "%s",
                  "domain": { "id": "default" },
                  "password": "%s"
                }
              }
            },
              "scope": {
                    "project": {
                        "domain": {
                            "id": "default"
                        },
                        "name": "admin"
                    }
                }
            }
        }
        """ % (configuration.openstack_user, configuration.openstack_password)

    try:
        _auth_token = ""
        request = urllib2.Request("http://" + configuration.openstack_host + _auth_url)
        request.add_header("Content-Type", "application/json")
        request.add_header("charset", "UTF-8")
        request.add_header("Content-Length", len(_auth_json))
        result = urllib2.urlopen(request, _auth_json)
        _auth_token = result.info().getheader('X-Subject-Token')
        # now get the tenant_id for the chosen project
        _tenant_id = get_project_id(configuration.openstack_project)
        # logger.debug(_auth_token)
        return True
    except URLError as e:
        logger.error("Could not authenticate to openstack!")
        logger.error("error was %s" % str(e))
        return False


def get_project_auth_token(project):
    """
    :param project: project name string
    :return: auth_token specific to this project, None on error
    """
    logger.debug("--- get_project_auth_token ---")

    global _project_auth_token
    global _project_token_cache_time

    now = time.time()
    diff = now - _project_token_cache_time

    if diff < _max_cache_time and _project_auth_token != "":
        return _project_auth_token

    logger.debug("refreshing project auth token")
    _project_token_cache_time = now
    _project_auth_token = ""

    _auth_json = """
        { "auth": {
            "identity": {
              "methods": ["password"],
              "password": {
                "user": {
                  "name": "%s",
                  "domain": { "id": "default" },
                  "password": "%s"
                }
              }
            },
              "scope": {
                    "project": {
                        "domain": {
                            "id": "default"
                        },
                        "name": "%s"
                    }
                }
            }
        }
        """ % (configuration.openstack_user, configuration.openstack_password, project)

    try:
        request = urllib2.Request("http://" + configuration.openstack_host + _auth_url)
        request.add_header("Content-Type", "application/json")
        request.add_header("charset", "UTF-8")
        request.add_header("Content-Length", len(_auth_json))
        result = urllib2.urlopen(request, _auth_json)
        _project_auth_token = result.info().getheader('X-Subject-Token')
        return _project_auth_token

    except URLError as e:
        logger.error("Could not get project auth token")
        logger.error("error was %s" % str(e))
        return None


def get_project_id(project_name):
    """
    Gets the UUID of the project by project_name
    :param project_name: Name of the Project
    :return: string UUID or None
    """

    logger.debug("--- get_project_id ---")

    projects_url = create_os_url('/projects')
    projects_string = do_get(projects_url)
    if projects_string is None:
        return None

    projects = json.loads(projects_string)
    for project in projects["projects"]:
        if project["name"] == project_name:
            return str(project["id"])

    return None


def get_network_id(network_name):
    """
    Gets the UUID of the network by network_name
    :param network_name: Name of the network
    :return: string UUID or None
    """

    logger.debug("--- get_network_id ---")

    networks_url = create_neutron_url('/networks?name=%s' % network_name)
    logger.info(networks_url)
    networks_string = do_get(networks_url)
    logger.info(networks_string)
    if networks_string is None:
        logger.error('Did not find a network for that name!')
        return None

    try:
        networks = json.loads(networks_string)
    except ValueError:
        logger.error('Could not parse json response in get_network_id')
        return None

    for network in networks["networks"]:
        if network["name"] == network_name:
            logger.info('Found id!')
            return str(network["id"])

    return None


def upload_image_to_glance_old(name, image_file_path):
    """

    :param name: name of the image to be uploaded
    :param image_file_path: full filesystem path as string to the image
    :return: json encoded results string from glance REST api
    """
    logger.debug("--- upload_image_to_glance ---")

    url = create_glance_url('/images')

    try:
        f = open(image_file_path, 'rb')
        fio = mmap.mmap(f.fileno(), 0, access=mmap.ACCESS_READ)

        request = urllib2.Request(url, fio)
        request.add_header("X-Auth-Token", _auth_token)
        request.add_header("Content-Type", "application/octet-stream")
        request.add_header("x-image-meta-name", name)
        request.add_header("x-image-meta-disk_format", "qcow2")
        request.add_header("x-image-meta-container_format", "bare")
        request.add_header("x-image-meta-is_public", "true")
        request.add_header("x-image-meta-min_ram", "1024")
        request.add_header("x-image-meta-min_disk", "1")
        result = urllib2.urlopen(request)
        return result.read()
    except Exception as e:
        logger.error("Could not upload image to glance")
        logger.error("error was %s" % str(e))

    finally:
        fio.close()
        f.close()
        return None


def upload_image_to_glance(name, image_file_path):
    """

    :param name: name of the image to be created
    :param image_file_path: path of the file to upload
    :return: json encoded results string from glance REST api
    """
    logger.debug("--- create_image_in_glance ---")

    url = create_glance_url('/images')

    try:

        d = dict()
        d['disk_format'] = 'qcow2'
        d['container_format'] = 'bare'
        d['name'] = name

        r_data = do_post(url, json.dumps(d))

    except Exception as e:
        logger.error("Could not upload image to glance")
        logger.error("error was %s" % str(e))
        return None

    try:
        r_json = json.loads(r_data)
        if 'id' in r_json:
            image_id = r_json['id']

            logger.info('Preparing to push image data to glance!')
            f = open(image_file_path, 'rb')
            fio = mmap.mmap(f.fileno(), 0, access=mmap.ACCESS_READ)
            upload_url = create_glance_url('/images/%s/file' % image_id)
            request = urllib2.Request(upload_url, fio)
            request.add_header("Content-Type", "application/octet-stream")
            request.add_header("X-Auth-Token", _auth_token)
            request.get_method = lambda: 'PUT'
            return urllib2.urlopen(request)
        else:
            logger.error('Could not find an ID key in returned json from glance image create')
            logger.error(r_data)
            logger.error('returning None')
            return None

    except ValueError:
        logger.error('Could not parse JSON return data from glance image create')
        return None


def get_neutron_ports_for_network(network_name):
    """
    :return: json response from /ports URL
    """
    logger.debug("--- get_neutron_port_list ---")

    network_id = get_network_id(network_name)
    if network_id is None:
        logger.warn("couldn't find the correct network_id")
        return None

    url = create_neutron_url("/ports.json?network_id=%s&fields=id&fields=fixed_ips" % network_id)
    logger.debug(url)
    port_list_string = do_get(url)
    logger.debug(port_list_string)

    return port_list_string


def get_consumed_management_ips():
    """
    Return a list of dicts of the format
    [
        { "ip-address": "xxx.xxx.xxx.xxx"}
    ]
    This mimics the libvirt dnsmasq format for dhcp reservations
    This is used in the wistarUtils.get_dhcp_reserved_ips() as a single place to
    get all reserved management ips
    :return: list of dicts
    """
    consumed_ips = list()
    ports_string = get_neutron_ports_for_network(configuration.openstack_mgmt_network)
    if ports_string is None:
        return consumed_ips
    try:
        ports = json.loads(ports_string)
    except ValueError:
        logger.error('Could not parse json response in get_consumed_management_ips')
        return consumed_ips

    if 'ports' not in ports:
        logger.error('unexpected keys in json response!')
        return consumed_ips

    for port in ports['ports']:
        for fixed_ip in port['fixed_ips']:
            if configuration.management_prefix in fixed_ip['ip_address']:
                fip = dict()
                fip['ip-address'] = fixed_ip['ip_address']
                consumed_ips.append(fip)

    return consumed_ips


def get_glance_image_list():
    """
    :return: list of json objects from glance /images URL filtered with only shared or public images
    """
    logger.debug("--- get_glance_image_list ---")

    url = create_glance_url("/images")
    image_list_string = do_get(url)

    image_list = list()

    if image_list_string is None:
        return image_list

    try:
        glance_return = json.loads(image_list_string)
    except ValueError:
        logger.warn('Could not parse json response from glance /images')
        return image_list

    if 'images' not in glance_return:
        logger.warn('did not find images key in glance return data')
        logger.debug(glance_return)
        return image_list

    for im in glance_return['images']:

        if 'status' in im and im['status'] != 'active':
            logger.debug('Skipping non-active image %s' % im['name'])
            continue

        if 'visibility' in im and im['visibility'] in ['shared', 'public']:
            image_list.append(im)

    return image_list


def get_glance_image_detail(glance_id):
    """
    :param glance_id: id of the glance image to retrieve
    :return: json response from glance /images/glance_id URL
    """
    logger.debug("--- get_glance_image_detail ---")

    url = create_glance_url("/images/%s" % glance_id)
    image_string = do_get(url)
    if image_string is None:
        return None

    return json.loads(image_string)


def get_image_id_for_name(image_name):
    """
    Returns the glance Id for the given image_name
    :param image_name: name of image to search for
    :return: glance id or None on failure
    """
    logger.debug("--- get_image_id_for_name ---")

    image_list = get_glance_image_list()
    if image_list is None or len(image_list) == 0:
        return None

    for image in image_list:
        if image["name"] == image_name:
            return image["id"]

    return None


def get_stack_details(stack_name):
    """
    Returns python object representing Stack details
    :param stack_name: name of the stack to find
    :return: stack object or None if not found!
    """
    logger.debug("--- get_stack_details ---")

    url = create_heat_url("/%s/stacks" % _tenant_id)

    stacks_list_string = do_get(url)
    stacks_list = json.loads(stacks_list_string)
    for stack in stacks_list["stacks"]:
        if stack["stack_name"] == stack_name:
            return stack

    logger.info("stack name %s was not found!" % stack_name)
    return None


def get_stack_resources(stack_name, stack_id):
    """
    Get all the resources for this Stack
    :param stack_name: name of stack
    :param stack_id: id of stack - use get_stack_details to retrieve this
    :return: json response from HEAT API
    """
    logger.debug("--- get_stack_resources ---")

    url = create_heat_url("/%s/stacks/%s/%s/resources" % (_tenant_id, stack_name, stack_id))
    stack_resources_string = do_get(url)
    if stack_resources_string is None:
        return None
    else:
        return json.loads(stack_resources_string)


def delete_stack(stack_name):
    """
    Deletes a stack from OpenStack
    :param stack_name: name of the stack to be deleted
    :return: JSON response fro HEAT API
    """
    logger.debug("--- delete_stack ---")

    stack_details = get_stack_details(stack_name)
    if stack_details is None:
        return None
    else:
        stack_id = stack_details["id"]
        url = create_heat_url("/%s/stacks/%s/%s" % (_tenant_id, stack_name, stack_id))
        return do_delete(url)


def get_nova_flavors(project_name):
    """
    Returns flavors for a specific project from Nova in JSON encoded string
    :return: JSON encoded string
    """
    logger.debug("--- get_nova_flavors ---")
    project_id = get_project_id(project_name)
    url = create_nova_url("/" + project_id + '/flavors/detail')
    return do_get(url)


def get_minimum_flavor_for_specs(project_name, cpu, ram, disk):
    """
    Query nova to get all flavors and return the flavor that best matches our desired constraints
    :param project_name: name of the project to check for flavors
    :param cpu: number of cores desired
    :param ram:  amount of ram desired in MB
    :param disk: amount of disk required in GB
    :return: flavor object {"name": "m1.xlarge"}
    """

    logger.debug("checking: " + str(cpu) + " " + str(ram) + " " + str(disk))

    # create an emergency flavor so we have something to return in case we can't connect to openstack
    # or some other issue prevents us from determining the right thing to do
    emergency_flavor = dict()
    emergency_flavor['name'] = "m1.xlarge"

    if not connect_to_openstack():
        return emergency_flavor

    flavors = get_nova_flavors(project_name)
    try:
        flavors_object = json.loads(flavors)
    except ValueError:
        logger.error('Could not parse nova return data')
        return emergency_flavor

    cpu_candidates = list()
    ram_candidates = list()
    disk_candidates = list()

    if "flavors" in flavors_object:
        logger.debug("checking flavors")

        # first, let's see if we have an exact match!
        for f in flavors_object["flavors"]:
            logger.debug("check flavors")
            logger.debug("checking flavor: " + f["name"])
            if f["vcpus"] == cpu and f["ram"] == ram and f["disk"] == disk:
                return f

        logger.debug("not exact match yet")
        # we don't have an exact match yet!
        for f in flavors_object["flavors"]:
            logger.debug(str(f["vcpus"]) + " " + str(cpu))
            if "vcpus" in f and f["vcpus"] >= int(cpu):
                cpu_candidates.append(f)

        logger.debug("got cpu candidates: " + str(len(cpu_candidates)))

        for f in cpu_candidates:
            if "ram" in f and f["ram"] >= ram:
                ram_candidates.append(f)

        logger.debug("got ram candidates: " + str(len(ram_candidates)))

        for f in ram_candidates:
            if "disk" in f and f["disk"] >= disk:
                disk_candidates.append(f)

        logger.debug("got disk candidates: " + str(len(disk_candidates)))

        if len(disk_candidates) == 0:
            # uh-oh, just return the largest and hope for the best!
            return emergency_flavor
        elif len(disk_candidates) == 1:
            return disk_candidates[0]
        else:
            # we have more than one candidate left
            # let's find the smallest flavor left!
            cpu_low = 99
            disk_low = 999
            ram_low = 99999
            for f in disk_candidates:
                if f["vcpus"] < cpu_low:
                    cpu_low = f["vcpus"]
                if f["ram"] < ram_low:
                    ram_low = f["ram"]
                if f["disk"] < disk_low:
                    disk_low = f["disk"]

            for f in disk_candidates:
                if f["vcpus"] == cpu_low and f["ram"] == ram_low and f["disk"] == disk_low:
                    # found the lowest available
                    logger.debug("return lowest across all axis")
                    return f
            for f in disk_candidates:
                if f["vcpus"] == cpu_low and f["ram"] == ram_low:
                    # lowest available along ram and cpu axis
                    logger.debug("return lowest across cpu and ram")
                    return f
            for f in disk_candidates:
                if f["vcpus"] == cpu:
                    logger.debug("return lowest cpu only")
                    logger.debug(f)
                    return f

            # should not arrive here :-/
            logger.debug("got to the impossible")
            return disk_candidates[0]


def create_stack(stack_name, template_string):
    """
    Creates a Stack via a HEAT template
    :param stack_name: name of the stack to create
    :param template_string: HEAT template to be used
    :return: JSON response from HEAT-API or None on failure
    """
    logger.debug("--- create_stack ---")

    url = create_heat_url("/" + str(_tenant_id) + "/stacks")
    data = '''{
        "disable_rollback": true,
        "parameters": {},
        "stack_name": "%s",
        "template": %s
    }''' % (stack_name, template_string)
    logger.debug("Creating stack with data:")
    logger.debug(data)
    return do_post(url, data)


def get_nova_serial_console(instance_name):
    """
    Get the websocket URL for the serial proxy for a given nova server (instance)
    :param instance_name: name of the instance
    :return: websocket url ws://x.x.x.x:xxxx/token=xxxxx
    """
    logger.debug("--- get_nova_serial_console ---")

    logger.debug("Looking for instance: %s" % instance_name)
    server_detail_url = create_nova_url('/%s/servers?name=%s' % (_tenant_id, instance_name))
    server_detail = do_nova_get(server_detail_url)

    # logger.debug("got details: %s" % server_detail)

    if server_detail is None:
        return None

    json_data = json.loads(server_detail)
    if len(json_data["servers"]) == 0:
        return None

    server_uuid = ""
    for s in json_data["servers"]:
        if s["name"] == instance_name:
            server_uuid = s["id"]
            break

    if server_uuid == "":
        logger.error("Console not found with server name %s" % instance_name)
        return None

    # logger.debug(server_uuid)
    data = '{"os-getSerialConsole": {"type": "serial"}}'
    url = create_nova_url('/%s/servers/%s/action' % (_tenant_id, server_uuid))

    try:
        project_auth_token = get_project_auth_token(configuration.openstack_project)
        request = urllib2.Request(url)
        request.add_header("Content-Type", "application/json")
        request.add_header("charset", "UTF-8")
        request.add_header("X-Auth-Token", project_auth_token)
        request.get_method = lambda: 'POST'
        result = urllib2.urlopen(request, data)
        console_json_data = json.loads(result.read())
        logger.debug(json.dumps(console_json_data, indent=2))
        return console_json_data["console"]["url"]
    except URLError as e:
        logger.error("Could not get serial console to instance: %s" % instance_name)
        logger.error("error was %s" % str(e))
        return None


# URL Utility functions
def create_glance_url(url):
    return "http://" + configuration.openstack_host + _glance_url + url


def create_neutron_url(url):
    return "http://" + configuration.openstack_host + _neutron_url + url


def create_os_url(url):
    return "http://" + configuration.openstack_host + _os_url + url


def create_heat_url(url):
    return "http://" + configuration.openstack_host + _heat_url + url


def create_nova_url(url):
    return "http://" + configuration.openstack_host + _nova_url + url


# Utility REST functions below
def do_get(url):
    """
    Performs a simple REST GET
    :param url: full URL for GET request
    :return: response from urllib2.urlopen(r).read() or None
    """
    try:
        request = urllib2.Request(url)
        request.add_header("Content-Type", "application/json")
        request.add_header("charset", "UTF-8")
        request.add_header("X-Auth-Token", _auth_token)
        request.get_method = lambda: 'GET'
        result = urllib2.urlopen(request)
        return result.read()
    except Exception as e:
        logger.error("Could not perform GET to url: %s" % url)
        logger.error("error was %s" % str(e))
        return None


def do_post(url, data):
    """
    Performs a simple REST POST
    :param url: full url to use for POST
    :param data: url encoded data
    :return: string response from urllib2.urlopen(r,data).read() or None
    """
    try:
        request = urllib2.Request(url)
        request.add_header("Content-Type", "application/json")
        request.add_header("charset", "UTF-8")
        request.add_header("Content-Length", len(data))
        request.add_header("X-Auth-Token", _auth_token)
        result = urllib2.urlopen(request, data)
        return result.read()
    except URLError as e:
        logger.error("Could not perform POST to url: %s" % url)
        logger.error("error was %s" % str(e))
        return None


def do_put(url, data=""):
    """
    Performs a simple REST PUT
    :param url: full URL to use for PUT
    :param data: url encoded data
    :return: string response from urllib2.urlopen(r, data).read() or None
    """
    try:
        request = urllib2.Request(url)
        request.add_header("Content-Type", "application/json")
        request.add_header("charset", "UTF-8")
        request.add_header("X-Auth-Token", _auth_token)
        request.get_method = lambda: 'PUT'

        if data == "":
            result = urllib2.urlopen(request)
        else:
            result = urllib2.urlopen(request, data)

        return result.read()
    except URLError as e:
        logger.error("Could not perform PUT to url: %s" % url)
        logger.error("error was %s" % str(e))
        return None


def do_nova_get(url):
    """
    Performs a simple REST GET
    :param url: full URL for GET request
    :return: response from urllib2.urlopen(r).read() or None
    """
    try:
        project_auth_token = get_project_auth_token(configuration.openstack_project)
        request = urllib2.Request(url)
        request.add_header("Content-Type", "application/json")
        request.add_header("charset", "UTF-8")
        request.add_header("X-Auth-Token", project_auth_token)
        request.get_method = lambda: 'GET'
        result = urllib2.urlopen(request)
        return result.read()
    except Exception as e:
        logger.error("Could not perform GET to url: %s" % url)
        logger.error("error was %s" % str(e))
        return None


def do_nova_delete(url, project_name, data=""):
    """
    Performs a DELETE request with the specified project auth token
    :param url: full url to use for DELETE
    :param project_name: name of the project
    :param data: (optional) url encoded data
    :return: string response from urllib2.urlopen(r, data).read() or None
    """
    logger.debug("--- connect_to_openstack ---")
    try:
        project_token = get_project_auth_token(project_name)
        request = urllib2.Request(url)
        request.add_header("Content-Type", "application/json")
        request.add_header("charset", "UTF-8")
        request.add_header("X-Auth-Token", project_token)
        request.get_method = lambda: 'DELETE'

        if data == "":
            result = urllib2.urlopen(request)
        else:
            result = urllib2.urlopen(request, data)

        return result.read()
    except URLError as e:
        logger.error("Could not perform DELETE to url: %s" % url)
        logger.error("error was %s" % str(e))
        return None


def do_delete(url, data=""):
    """
    Performs a simple REST DELETE call
    :param url: full url to use for Delete
    :param data: (optional) url encoded data
    :return: string response from urllib2.urlopen(r, data).read() or None
    """
    try:
        request = urllib2.Request(url)
        request.add_header("Content-Type", "application/json")
        request.add_header("charset", "UTF-8")
        request.add_header("X-Auth-Token", _auth_token)
        request.get_method = lambda: 'DELETE'

        if data == "":
            result = urllib2.urlopen(request)
        else:
            result = urllib2.urlopen(request, data)

        return result.read()
    except URLError as e:
        logger.error("Could not perform DELETE to url: %s" % url)
        logger.error("error was %s" % str(e))
        return None
