import urllib2
import mmap
import json

from urllib2 import URLError
from wistar import configuration


# all OpenStack component URLs
_glance_url = ':9292/v1'
_analytics_url = ':8081'
_api_url = ':8082'
_os_url = ':5000/v3'
_nova_url = ':8774/v2'
_neutron_url = ':9696/v2.0'
_glance_url = ':9292/v1'
_heat_url = ':8004/v1'
_auth_url = _os_url + "/auth/tokens"
_data_url = ':8143/api/tenant/networking/'

# auth token will get populated by connect on each instantiation
# and referenced by each subsequent call
_auth_token = ""
_tenant_id = ""


def create_glance_url(url):
    return "http://" + configuration.openstack_host + _glance_url + url


def create_os_url(url):
    return "http://" + configuration.openstack_host + _os_url + url


def create_heat_url(url):
    if not url.startswith("/"):
        url = "/" + url

    return "http://" + configuration.openstack_host + _heat_url + url


def create_nova_url(url):
    return "http://" + configuration.openstack_host + _nova_url + url


def connect_to_openstack():
    """
    authenticates to keystone at configuration.openstack_host with OPENSTACK_USER, OPENSTACK_PASS
    will set the _auth_token property on success, which is then used for all subsequent
    calls from this module
    :return: True on successful authentication to keystone, False otherwise
    """
    global _auth_token
    global _tenant_id

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
        request = urllib2.Request("http://" + configuration.openstack_host + _auth_url)
        request.add_header("Content-Type", "application/json")
        request.add_header("charset", "UTF-8")
        request.add_header("Content-Length", len(_auth_json))
        result = urllib2.urlopen(request, _auth_json)
        _auth_token = result.info().getheader('X-Subject-Token')
        # now get the tenant_id for the chosen project
        _tenant_id = get_project_id(configuration.openstack_project)
        return True
    except URLError as e:
        print str(e)
        return False


def get_project_auth_token(project):
    """
    :param project: project name string
    :return: auth_token specific to this project, None on error
    """
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
        return result.info().getheader('X-Subject-Token')
    except URLError as e:
        print str(e)
        return None


def get_project_id(project_name):
    """
    Gets the UUID of the project by project_name
    :param project_name: Name of the Project
    :return: string UUID or None
    """
    projects_url = create_os_url('/projects')
    projects_string = do_get(projects_url)
    if projects_string is None:
        return None

    projects = json.loads(projects_string)
    for project in projects["projects"]:
        if project["name"] == project_name:
            return str(project["id"])

    return None


def upload_image_to_glance(name, image_file_path):
    """

    :param name: name of the image to be uploaded
    :param image_file_path: full filesystem path as string to the image
    :return: json encoded results string from glance REST api
    """

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
        print str(e)

    finally:
        fio.close()
        f.close()
        return None


def list_glance_images():
    """
    :return: json response from glance /images URL
    """
    url = create_glance_url('/images')
    return do_get(url)


def get_glance_image_detail(glance_id):
    """
    :param glance_id: id of the glance image to retrieve
    :return: json response from glance /images/glance_id URL
    """
    url = create_glance_url("/images/detail")
    print url
    image_list_string = do_get(url)
    if image_list_string is None:
        return None

    image_list = json.loads(image_list_string)
    for image in image_list["images"]:
        if image["id"] == glance_id:
            return image

    return None


def get_image_id_for_name(image_name):
    """
    Returns the glance Id for the given image_name
    :param image_name: name of image to search for
    :return: glance id or None on failure
    """
    image_list_string = list_glance_images()
    if image_list_string is None:
        return None

    image_list = json.loads(image_list_string)
    for image in image_list["images"]:
        if image["name"] == image_name:
            return image["id"]

    return None


def get_stack_details(stack_name):
    """
    Returns python object representing Stack details
    :param stack_name: name of the stack to find
    :return: stack object or None if not found!
    """
    url = create_heat_url("/%s/stacks" % _tenant_id)
    print url
    print _auth_token
    stacks_list_string = do_get(url)
    print stacks_list_string
    stacks_list = json.loads(stacks_list_string)
    for stack in stacks_list["stacks"]:
        if stack["stack_name"] == stack_name:
            return stack

    print "stack name %s was not found!" % stack_name
    return None


def get_stack_resources(stack_name, stack_id):
    """
    Get all the resources for this Stack
    :param stack_name: name of stack
    :param stack_id: id of stack - use get_stack_details to retrieve this
    :return: json response from HEAT API
    """
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
    stack_details = get_stack_details(stack_name)
    if stack_details is None:
        return None
    else:
        stack_id = stack_details["id"]
        url = create_heat_url("/%s/stacks/%s/%s" % (_tenant_id, stack_name, stack_id))
        return do_delete(url)


def get_nova_flavors():
    """
    Returns flavors from Nova in JSON encoded string
    :return: JSON encoded string
    """
    url = create_nova_url('/flavors')
    return do_get(url)


def create_stack(stack_name, template_string):
    """
    Creates a Stack via a HEAT template
    :param stack_name: name of the stack to create
    :param template_string: HEAT template to be used
    :return: JSON response from HEAT-API or None on failure
    """
    url = create_heat_url("/" + str(_tenant_id) + "/stacks")
    data = '''{
        "disable_rollback": true,
        "parameters": {},
        "stack_name": "%s",
        "template": %s
    }''' % (stack_name, template_string)
    print url
    print "----"
    print data
    print "----"
    return do_post(url, data)


# Utility REST functions below
def do_get(url):
    try:
        request = urllib2.Request(url)
        request.add_header("Content-Type", "application/json")
        request.add_header("charset", "UTF-8")
        request.add_header("X-Auth-Token", _auth_token)
        request.get_method = lambda: 'GET'
        result = urllib2.urlopen(request)
        return result.read()
    except Exception as e:
        print str(e)
        return None


def do_post(url, data):
    try:
        request = urllib2.Request(url)
        request.add_header("Content-Type", "application/json")
        request.add_header("charset", "UTF-8")
        request.add_header("Content-Length", len(data))
        request.add_header("X-Auth-Token", _auth_token)
        result = urllib2.urlopen(request, data)
        return result.read()
    except URLError as e:
        print str(e)
        return None


def do_put(url, data=""):
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
        print str(e)
        return None


def do_nova_delete(url, project_name, data=""):
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
        print str(e)
        return None


def do_delete(url, data=""):
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
        print str(e)
        return None
