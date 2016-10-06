#!/usr/bin/python
# Demonstration contrail REST API library
# nembery@juniper.net
import urllib2
import urllib
import platform
import json
import time
import netaddr
import mmap


class ContrailClient:
    _user = ''
    _pw = ''
    _host = ''
    _analytics_url = ':8081'
    _api_url = ':8082'
    _os_url = ':5000/v3'
    _nova_url = ':8774/v2'
    _neutron_url = ':9696/v2.0'
    _glance_url = ':9292/v1'
    _heat_url = ':8004/v1'
    _auth_url = _os_url + "/auth/tokens"
    _data_url = ':8143/api/tenant/networking/'

    _auth_token = ""

    _project_uuid_cache = dict()

    def __init__(self, user, pw, host):
        self._user = user
        self._pw = pw
        self._host = host

    def connect(self):

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
            """ % (self._user, self._pw)

        request = urllib2.Request("http://" + self._host + self._auth_url)
        request.add_header("Content-Type", "application/json")
        request.add_header("charset", "UTF-8")
        request.add_header("X-Contrail-Useragent", "%s:%s" % (platform.node(), "contrail_utils"))
        request.add_header("Content-Length", len(_auth_json))
        result = urllib2.urlopen(request, _auth_json)
        self._auth_token = result.info().getheader('X-Subject-Token')
        return True

    # nova api requires a project specific auth token
    def get_project_auth_token(self, project):

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
            """ % (self._user, self._pw, project)

        request = urllib2.Request("http://" + self._host + self._auth_url)
        request.add_header("Content-Type", "application/json")
        request.add_header("charset", "UTF-8")
        request.add_header("X-Contrail-Useragent", "%s:%s" % (platform.node(), "contrail_utils"))
        request.add_header("Content-Length", len(_auth_json))
        result = urllib2.urlopen(request, _auth_json)
        return result.info().getheader('X-Subject-Token')

    def get_default_domain(self):
        json_string = self.do_get(self.create_os_url('/domains'))
        j = json.loads(json_string)
        return json.dumps(j, indent=4, separators=(',', ': '))

    def list_resources(self):
        return self.do_get(self.create_api_url(""))

    def do_json_request_to_url(self, url):
        return self.do_get(self.create_api_url(url))

    def get_url(self, url):
        if not url.startswith('/'):
            url = "/" + url

        json_string = self.do_json_request_to_url(url)
        j = json.loads(json_string)
        return json.dumps(j, indent=2)

    def get_os_url(self, url):
        os_url = self.create_os_url(url)
        json_string = self.do_get(os_url)
        j = json.loads(json_string)
        return json.dumps(j, indent=2)

    def get_neutron_url(self, url):
        n_url = self.create_neutron_url(url)
        json_string = self.do_get(n_url)
        j = json.loads(json_string)
        return json.dumps(j, indent=2)

    def get_json(self, url):
        json_string = self.do_get(url)
        return json.loads(json_string)

    def list_virtual_networks(self):
        """
        List all virtual-networks
        :return: json encoded dict of virtual-networks
        """
        url = '/virtual-networks'
        return self.do_get(self.create_api_url(url))

    def list_service_instances(self):
        url = '/service-instances'
        return self.do_get(self.create_api_url(url))

    def create_project(self, name, display_name):
        project_data = """
        {
            "project": {
                "description": "%s",
                "name": "%s"
            }
        }""" % (display_name, name)
        url = self.create_os_url('/projects')
        return self.do_post(url, project_data)

    def delete_project_21(self, project_id):
        """
        Code necessary to safely delete from contrail 2.1
        behaviour change in 2.2
        :param project_id:
        :return:
        """
        try:
            print "deleting from openstack"
            # openstack cannot recognize uuid with '-'
            os_uuid = project_id.replace('-', '')
            os_url = self.create_os_url('/projects/%s' % os_uuid)
            print os_url
            self.do_delete(os_url)
            # give contrail 3 seconds to catch up!
            time.sleep(3)

        except urllib2.HTTPError as he:
            print "Caught error - continuing..."
            print str(he)
            try:
                # if we can't delete it from openstack, but we still can get here
                # something is out of sync, go ahead and get rid of it from contrail
                api_url = self.create_api_url('/project/%s' % project_id)
                self.do_delete(api_url)
                print "project deleted successfully"
            except urllib2.HTTPError:
                print "damn it"

    def delete_project(self, project_id):
        try:
            print "clearing project_uuid_cache"
            self._project_uuid_cache.clear()

            print "deleting from openstack"
            # openstack cannot recognize uuid with '-'
            os_uuid = project_id.replace('-', '')
            os_url = self.create_os_url('/projects/%s' % os_uuid)
            print os_url
            self.do_delete(os_url)
            # give contrail 3 seconds to catch up!
            time.sleep(3)

        except urllib2.HTTPError as he:
            print "Caught error - continuing..."
            print str(he)

        # go ahead and delete from Contrail as well...
        try:
            print "Deleting from Contrail"
            # if we can't delete it from openstack, but we still can get here
            # something is out of sync, go ahead and get rid of it from contrail
            api_url = self.create_api_url('/project/%s' % project_id)
            self.do_delete(api_url)
            print "project deleted successfully"
        except urllib2.HTTPError:
            print "Could not delete from Contrail"

    def create_default_network(self, tenant_id):
        data = """
        {
            "network": {
                "name": "ipam-default",
                "admin_state_up": true,
                "tenant_id": "%s"
            }
        }""" % tenant_id
        url = self.create_neutron_url('/networks')
        return self.do_post(url, data)

    def configure_security_group_rules(self, tenant_id):
        security_groups_url = self.create_neutron_url('/security-groups')
        groups = self.get_json(security_groups_url)
        found = False
        security_group_id = ""
        for group in groups["security_groups"]:
            if group["tenant_id"] == tenant_id:
                security_group_id = str(group["id"])
                found = True

        if not found:
            return "ERROR"

        security_group_url = self.create_neutron_url('/security-groups/%s' % security_group_id)
        group = self.get_json(security_group_url)
        # Delete all the existing rules
        for rule in group["security_group"]["security_group_rules"]:
            rule_id = rule["id"]
            security_group_rule_url = self.create_neutron_url('/security-group-rules/%s' % rule_id)
            self.do_delete(security_group_rule_url)

        # pretty ugly way to do this, but time is tight!
        # prefer to be VERBOSE for this type of example code! No fancy optimizations here!
        security_group_rule_create_url = self.create_neutron_url('/security-group-rules')

        rule_1_data = """
            {
                "security_group_rule": {
                    "remote_group_id": null,
                    "direction": "ingress",
                    "remote_ip_prefix": "0.0.0.0/0",
                    "protocol": "icmp",
                    "ethertype": "IPv4",
                    "security_group_id": "%s",
                    "port_range_min": 0,
                    "tenant_id": "%s"
                }
            }""" % (security_group_id, tenant_id)

        print "Creating rule 1"
        self.do_post(security_group_rule_create_url, rule_1_data)

        rule_2_data = """
            {
                "security_group_rule": {
                    "remote_group_id": null,
                    "direction": "egress",
                    "port_range_min": 0,
                    "ethertype": "IPv4",
                    "remote_ip_prefix": "0.0.0.0/0",
                    "protocol": "icmp",
                    "security_group_id": "%s"
                }
            }""" % security_group_id

        print "Creating rule 2"
        self.do_post(security_group_rule_create_url, rule_2_data)

        rule_3_data = """
            {
                "security_group_rule": {
                    "remote_group_id": null,
                    "direction": "ingress",
                    "port_range_min": 1,
                    "ethertype": "IPv4",
                    "port_range_max": 65535,
                    "remote_ip_prefix": "0.0.0.0/0",
                    "protocol": "tcp",
                    "security_group_id": "%s"
                }
            }""" % security_group_id

        print "Creating rule 3"
        self.do_post(security_group_rule_create_url, rule_3_data)

        rule_4_data = """
            {
                "security_group_rule": {
                    "remote_group_id": null,
                    "direction": "egress",
                    "port_range_min": 1,
                    "ethertype": "IPv4",
                    "port_range_max": 65535,
                    "remote_ip_prefix": "0.0.0.0/0",
                    "protocol": "tcp",
                    "security_group_id": "%s"
                }
            }""" % security_group_id

        print "Creating rule 4"
        self.do_post(security_group_rule_create_url, rule_4_data)

        rule_5_data = """
            {
                "security_group_rule": {
                    "remote_group_id": null,
                    "direction": "ingress",
                    "port_range_min": 1,
                    "ethertype": "IPv4",
                    "port_range_max": 65535,
                    "remote_ip_prefix": "0.0.0.0/0",
                    "protocol": "udp",
                    "security_group_id": "%s"
                }
            }""" % security_group_id

        print "Creating rule 5"
        self.do_post(security_group_rule_create_url, rule_5_data)

        rule_6_data = """
            {
                "security_group_rule": {
                    "remote_group_id": null,
                    "direction": "egress",
                    "port_range_min": 1,
                    "ethertype": "IPv4",
                    "port_range_max": 65535,
                    "remote_ip_prefix": "0.0.0.0/0",
                    "protocol": "udp",
                    "security_group_id": "%s"
                }
            }""" % security_group_id

        print "Creating rule 6"
        self.do_post(security_group_rule_create_url, rule_6_data)

        return "OK"

    def get_project_id(self, project_name):

        # micro optimization. Let's keep these queries around
        # in a small cache
        if project_name in self._project_uuid_cache.keys():
            print "cache hit!"
            return self._project_uuid_cache[project_name]

        projects_url = self.create_os_url('/projects')
        projects = self.get_json(projects_url)
        for project in projects["projects"]:
            if project["name"] == project_name:
                self._project_uuid_cache[project_name] = project["id"]
                return str(project["id"])

        return "ERROR"

    def get_admin_user_id(self):
        users_url = self.create_os_url('/users')
        users = self.get_json(users_url)
        for user in users["users"]:
            if user["name"] == "admin":
                return str(user["id"])

        return "ERROR"

    def get_admin_role_id(self):
        roles_url = self.create_os_url('/roles')
        roles = self.get_json(roles_url)
        for role in roles["roles"]:
            if role["name"] == "admin":
                return str(role["id"])

        return "ERROR"

    def get_member_role_id(self):
        roles_url = self.create_os_url('/roles')
        roles = self.get_json(roles_url)
        for role in roles["roles"]:
            if role["name"] == "_member_":
                return str(role["id"])

        return "ERROR"

    def get_virtual_network_id(self, project_name, virtual_network_name):
        virtual_networks_url = self.create_api_url('/virtual-networks')
        virtual_networks = self.get_json(virtual_networks_url)
        for virtual_network in virtual_networks["virtual-networks"]:
            if virtual_network["fq_name"][1] == project_name and \
                    virtual_network["fq_name"][2] == virtual_network_name:
                return str(virtual_network["uuid"])

        return "ERROR"

    def get_network_policy_id(self, project_name, network_policy_name):
        network_policys_url = self.create_api_url('/network-policys')
        network_policys = self.get_json(network_policys_url)
        for network_policy in network_policys["network-policys"]:
            if network_policy["fq_name"][1] == project_name and \
                    network_policy["fq_name"][2] == network_policy_name:
                return str(network_policy["uuid"])

        return "ERROR"

    def get_service_template_name(self, service_template_uuid):
        service_templates_url = self.create_api_url('/service-templates')
        service_templates = self.get_json(service_templates_url)
        for service_template in service_templates["service-templates"]:
            if service_template["uuid"] == service_template_uuid:
                return str(service_template["fq_name"][1])

        return "ERROR"

    def get_service_template_interface_type(self, service_template_uuid):
        service_templates_url = self.create_api_url('/service-templates')
        service_templates = self.get_json(service_templates_url)
        for service_template in service_templates["service-templates"]:
            if service_template["uuid"] == service_template_uuid:
                service_template_url = self.create_api_url("/service-template/%s" % service_template_uuid)
                service_template = self.get_json(service_template_url)
                return service_template["service-template"]["service_template_properties"]["interface_type"]

        return "ERROR"

    def get_service_instances_for_network_policy(self, service_id):
        network_policy_detail = self.get_url("/network-policy/%s" % service_id)
        npdj = json.loads(network_policy_detail)

        service_chain = []
        rules = npdj["network-policy"]["network_policy_entries"]["policy_rule"]
        # NOTE - we always assume a single rule
        for index, service_instance in \
                enumerate(rules[0]["action_list"]["apply_service"]):
            si = dict()
            si["fq_name"] = service_instance
            si["id"] = index
            si["name"] = service_instance.split(":")[2]
            si["display_name"] = si["name"].replace('_', ' ')
            service_chain.append(si)

        return service_chain

    # Get a list of service instances that are from a template
    # that has a name prefixed by 'SA_' or 'SA-'
    def get_stand_alone_service_instances_for_project(self, project_id):
        print "Getting standalone instances for project"
        service_instances = self.get_url("/service-instances?parent_id=%s" % project_id)
        sij = json.loads(service_instances)

        instances = []

        for service_instance in sij["service-instances"]:
            uuid = service_instance["uuid"]
            service_instance_details = self.get_url('/service-instance/%s' % uuid)
            sidj = json.loads(service_instance_details)
            si = dict()
            print "Found instance: " + str(service_instance["fq_name"])
            si["fq_name"] = service_instance["fq_name"]
            si["uuid"] = uuid
            si["name"] = sidj["service-instance"]["name"]
            si["display_name"] = sidj["service-instance"]["display_name"].replace("_", " ")
            si["template_name"] = sidj["service-instance"]["service_template_refs"][0]["to"][1]

            # now, let's parse out the 'location'
            # location is used to name the network policy and all virtual networks for a location
            # networks are named by location + "_left|_right|_other|_management"
            # removing the _left will leave us with the location name where this service instance was deployed
            left_network = sidj["service-instance"]["service_instance_properties"]["left_virtual_network"]
            si["location"] = left_network.split(":")[2].replace("_left", "")
            print "with template: " + si["template_name"]
            if "SA-" in si["template_name"] or "SA_" in si["template_name"]:
                print "appending: " + str(si)
                instances.append(si)

        return instances

    def add_admin_to_project(self, project_name):
        project_id = self.get_project_id(project_name)
        admin_id = self.get_admin_user_id()
        admin_role_id = self.get_admin_role_id()
        member_role_id = self.get_member_role_id()

        member_url = "/projects/%s/users/%s/roles/%s" % (project_id, admin_id, member_role_id)
        self.do_put(self.create_os_url(member_url))

        admin_url = "/projects/%s/users/%s/roles/%s" % (project_id, admin_id, admin_role_id)
        self.do_put(self.create_os_url(admin_url))

        print "Added admin to project"
        return True

    def create_virtual_network(self, project_name, network_name, route_target,
                               route_distinguisher, ip_prefix, ip_prefix_len):
        """
        Creates a virtual network
        Will calculate the gateway as broadcast -1
        """
        print "creating virtual_network"
        print ip_prefix
        print ip_prefix_len

        cidr = ip_prefix + "/" + ip_prefix_len

        ip_network = netaddr.IPNetwork(cidr)
        gateway = str(netaddr.IPAddress(ip_network.last - 1))
        dns = str(netaddr.IPAddress(ip_network.last - 2))

        # get parent_uuid
        project_uuid = self.get_project_id(project_name)

        virtual_network_data = """
            {{
              "virtual-network": {{
                "virtual_network_properties": {{
                  "forwarding_mode": "l2_l3",
                  "allow_transit": false
                }},
                "fq_name": [
                  "default-domain",
                  "{0:s}",
                  "{1:s}"
                ],
                "is_shared": false,
                "physical-routers": [],
                "router_external": false,
                "parent_type": "project",
                "route_target_list": {{
                     "route_target": [
                        "target:{2:s}:{3:s}"
                    ]
                }},
                "id_perms": {{
                  "enable": true
                }},
                "flood_unknown_unicast": false,
                "display_name": "{1:s}",
                "network_ipam_refs": [
                  {{
                    "to": [
                      "default-domain",
                      "default-project",
                      "default-network-ipam"
                    ],
                    "attr": {{
                      "ipam_subnets": [
                        {{
                          "subnet": {{
                            "ip_prefix": "{4:s}",
                            "ip_prefix_len": {5:s}
                          }},
                          "enable_dhcp": true,
                          "default_gateway": "{6:s}",
                          "dns_server_address": "{7:s}",
                          "allocation_pools": [],
                          "dhcp_option_list": {{
                            "dhcp_option": []
                          }},
                          "host_routes": {{
                            "route": []
                          }},
                          "addr_from_start": true
                        }}
                      ]
                    }}
                  }}
                ],
                "parent_uuid": "{8:s}"
              }}
            }}""".format(project_name, network_name, route_target,
                         route_distinguisher, ip_prefix, ip_prefix_len, gateway, dns, project_uuid)

        url = self.create_api_url('/virtual-networks')
        print url
        print virtual_network_data
        return self.do_post(url, virtual_network_data)

    def create_network_policy(self, project_name, policy_name, left, right):
        network_policy_data = """
            {{
              "network-policy": {{
                "fq_name": [
                  "default-domain",
                  "{0:s}",
                  "{1:s}"
                ],
                "parent_type": "project",
                "network_policy_entries": {{
                  "policy_rule": [
                    {{
                      "direction": "<>",
                      "protocol": "any",
                      "dst_addresses": [
                        {{
                          "virtual_network": "default-domain:{0:s}:{3:s}"
                        }}
                      ],
                      "dst_ports": [
                        {{
                          "end_port": -1,
                          "start_port": -1
                        }}
                      ],
                      "src_addresses": [
                        {{
                          "virtual_network":  "default-domain:{0:s}:{2:s}"
                        }}
                      ],
                      "action_list": {{
                        "simple_action": "pass"
                      }},
                      "src_ports": [
                        {{
                          "end_port": -1,
                          "start_port": -1
                        }}
                      ]
                    }}
                  ]
                }}
              }}
            }}""".format(project_name, policy_name, left, right)
        url = self.create_api_url('/network-policys')
        print url
        print network_policy_data
        return self.do_post(url, network_policy_data)

    def add_network_policy_to_virtual_network(self, project_name, policy_name, virtual_network_name):
        virtual_network_id = self.get_virtual_network_id(project_name, virtual_network_name)

        update_data = """{
                "virtual-network": {
                    "fq_name": [
                        "default-domain",
                        "%s",
                        "%s"
                    ],
                    "network_policy_refs": [
                        {
                            "to": [
                                "default-domain",
                                "%s",
                                "%s"
                            ],
                            "attr": {
                                "sequence": {
                                    "major": 0,
                                    "minor": 0
                                }
                            }
                        }
                    ]
                }
            }
            """ % (project_name, virtual_network_name, project_name, policy_name)
        url = self.create_api_url('/virtual-network/%s' % virtual_network_id)
        print url
        print update_data
        return self.do_put(url, update_data)

    def create_service_instance(self, project_name, instance_name, template_name, location, interface_order):

        interface_list_json = dict()
        interface_list_json["interface_list"] = []
        for io in interface_order:
            vn_json = dict()
            vn_json["virtual_network"] = "default-domain:%s:%s" % (project_name, io)
            interface_list_json["interface_list"].append(vn_json)

        management = location + "_management"
        left = location + "_left"
        right = location + "_right"

        interface_list_string = json.dumps(interface_list_json["interface_list"], indent=2)

        project_uuid = self.get_project_id(project_name)

        # BUG - instance name cannot contain spaces!
        # if it does contain spaces, the instance will spawn
        # but will not get an IP address
        cleaned_name = instance_name.replace(" ", "_")

        instance_data = """
        {{
            "service-instance": {{
                "fq_name": [
                    "default-domain",
                    "{0:s}",
                    "{8:s}"
                ],
                "parent_type": "project",
                "parent_uuid": "{7:s}",
                "service_instance_properties": {{
                    "management_virtual_network": "default-domain:{0:s}:{2:s}",
                    "right_virtual_network": "default-domain:{0:s}:{4:s}",
                    "scale_out": {{
                        "max_instances": 1
                    }},
                    "left_virtual_network": "default-domain:{0:s}:{3:s}",
                    "interface_list": {6:s}
                }},
                "display_name": "{1:s}",
                "service_template_refs": [
                    {{
                        "to": [
                            "default-domain",
                            "{5:s}"
                        ]
                    }}
                ]
            }}
        }}

        """.format(project_name, instance_name, management, left, right,
                   template_name, interface_list_string, project_uuid, cleaned_name)

        url = self.create_api_url('/service-instances')
        print url
        print instance_data
        return self.do_post(url, instance_data)

    def add_service_instance_to_network_policy(self, project_name, network_policy, service_instance, left, right):
        network_policy_id = self.get_network_policy_id(project_name, network_policy)

        cleaned_instance_name = service_instance.replace(' ', '_')

        network_policy_data = """
            {{
              "network-policy": {{
                "fq_name": [
                  "default-domain",
                  "{0:s}",
                  "{1:s}"
                ],
                "parent_type": "project",
                "network_policy_entries": {{
                  "policy_rule": [
                    {{
                      "direction": "<>",
                      "protocol": "any",
                      "dst_addresses": [
                        {{
                          "virtual_network": "default-domain:{0:s}:{3:s}"
                        }}
                      ],
                      "dst_ports": [
                        {{
                          "end_port": -1,
                          "start_port": -1
                        }}
                      ],
                      "src_addresses": [
                        {{
                          "virtual_network":  "default-domain:{0:s}:{2:s}"
                        }}
                      ],
                      "action_list": {{
                        "simple_action": "pass",
                            "apply_service": [
                                "default-domain:{0:s}:{5:s}"
                            ]
                      }},
                      "src_ports": [
                        {{
                          "end_port": -1,
                          "start_port": -1
                        }}
                      ]
                    }}
                  ]
                }}
              }}
            }}""".format(project_name, network_policy, left, right,
                         service_instance, cleaned_instance_name)

        url = self.create_api_url('/network-policy/%s' % network_policy_id)
        print url
        return self.do_put(url, network_policy_data)

    def delete_network_policy_from_virtual_network(self, project_name, virtual_network_name):
        """
        :param project_name:
        :param virtual_network_name:
        :return:
        Removes all network policy from virtual_network
        """
        virtual_network_id = self.get_virtual_network_id(project_name, virtual_network_name)

        update_data = """{
                "virtual-network": {
                    "fq_name": [
                        "default-domain",
                        "%s",
                        "%s"
                    ],
                    "network_policy_refs": []
                }
            }
            """ % (project_name, virtual_network_name)
        url = self.create_api_url('/virtual-network/%s' % virtual_network_id)
        print url
        print update_data
        return self.do_put(url, update_data)

    def get_id_by_fqname(self, fqname, object_type):
        post_data = """
        {
            "fq_name": %s,
            "type": "%s"
        }
        """ % (fqname, object_type)

        url = self.create_api_url('/fqname-to-id')
        print url
        print post_data
        try:
            return self.do_post(url, post_data)
        except urllib2.HTTPError as he:
            print "http error: %s" % str(he)
            raise Exception("not found")

    def delete_service_instance(self, instance_id):
        si = self.get_json(self.create_api_url('/service-instance/%s' % instance_id))
        if "virtual_machine_back_refs" in si["service-instance"]:
            project_uuid = si["service-instance"]["parent_uuid"]
            project_name = si["service-instance"]["fq_name"][1]
            for vmbr in si["service-instance"]["virtual_machine_back_refs"]:
                # vm = self.get_json(self.create_api_url('/virtual-machine/%s' % vmbr["uuid"]))
                self.delete_nova_instance(vmbr["uuid"], project_uuid, project_name)
                time.sleep(2)
                # if "virtual_machine_interface_back_refs" in vm["virtual-machine"]:
                #    for vmibr in vm["virtual-machine"]["virtual_machine_interface_back_refs"]:
                #        vmi = self.get_json(self.create_api_url('/virtual-machine-interface/%s' % vmibr["uuid"]))
                #        if "instance_ip_back_refs" in vmi["virtual-machine-interface"]:
                #            for iibr in vmi["virtual-machine-interface"]["instance_ip_back_refs"]:
                #                print "deleting instance_ip: %s" % iibr["uuid"]
                #                self.delete_url("instance-ip", iibr["uuid"])
                #                time.sleep(.5)

                #       print "deleting virtual_machine_interface: %s" % vmibr["uuid"]
                #       self.delete_url("virtual-machine-interface", vmibr["uuid"])
                #       time.sleep(.5)

                # print "deleting virtual-machine: %s" % vmbr["uuid"]
                # self.delete_url("virtual-machine", vmbr["uuid"])
                # time.sleep(.5)

        print "deleting service_instance: %s " % si["service-instance"]["uuid"]
        self.delete_url("service-instance", si["service-instance"]["uuid"])

    def delete_nova_instance(self, vm_uuid, project_uuid, project_name):
        try:
            url = self.create_nova_url("/%s/servers/%s" % (project_uuid.replace("-", ""), vm_uuid))
            print url
            self.do_nova_delete(url, project_name)
        except urllib2.HTTPError as he:
            # smother the error
            print "Could not delete nova instance!!!"
            print str(he)
        except IOError as io:
            print "Caught io error: %s" % str(io)

    def delete_virtual_network(self, virtual_network_id):
        virtual_network_detail = self.get_url('/virtual-network/%s' % virtual_network_id)
        vndj = json.loads(virtual_network_detail)

        if "instance_ip_back_refs" in vndj["virtual-network"]:
            for iibr in vndj["virtual-network"]["instance_ip_back_refs"]:
                print "Deleting interface ip back ref: %s" % iibr["uuid"]
                self.delete_url('instance-ip', iibr["uuid"])

        if "virtual_machine_interface_back_refs" in vndj["virtual-network"]:
            for vmibr in vndj["virtual-network"]["virtual_machine_interface_back_refs"]:
                print "Deleting virtual machine inteface back ref: %s" % vmibr["uuid"]
                self.delete_url('virtual-machine-interface', vmibr["uuid"])

        print "Deleting virtual network: %s" % virtual_network_id
        self.delete_url('virtual-network', virtual_network_id)

    def delete_network_policy(self, network_policy_id):
        network_policy_detail = self.get_url("/network-policy/%s" % network_policy_id)
        npdj = json.loads(network_policy_detail)

        # First let's remove any service instances that are associated!
        rules = npdj["network-policy"]["network_policy_entries"]["policy_rule"]

        # simply overwrite all apply_sevices that may exist here, we'll clean them up later
        rules[0]["action_list"]["apply_service"] = []

        update_data = dict()
        update_data["network-policy"] = dict()
        update_data["network-policy"]["fq_name"] = npdj["network-policy"]["fq_name"]
        update_data["network-policy"]["parent_type"] = npdj["network-policy"]["parent_type"]
        update_data["network-policy"]["network_policy_entries"] = npdj["network-policy"]["network_policy_entries"]

        network_policy_update_data = json.dumps(update_data)

        url = self.create_api_url('/network-policy/%s' % network_policy_id)

        self.do_put(url, network_policy_update_data)

        # Now, let's disassociate this policy from all it's associated networks
        for vnbr in npdj["network-policy"]["virtual_network_back_refs"]:
            self.delete_network_policy_from_virtual_network(vnbr["to"][1], vnbr["to"][2])
            time.sleep(.5)

        self.do_delete(url)

    def delete_url(self, url, instance_id):
        url = self.create_api_url('/%s/%s' % (url, instance_id))
        return self.do_delete(url)

    def create_api_url(self, url):
        return "http://" + self._host + self._api_url + url

    def create_os_url(self, url):
        return "http://" + self._host + self._os_url + url

    def create_neutron_url(self, url):
        return "http://" + self._host + self._neutron_url + url

    def create_nova_url(self, url):
        return "http://" + self._host + self._nova_url + url

    def create_data_url(self, url):
        return "http://" + self._host + self._data_url + url

    def query_data(self, post_data):
        url = "http://" + self._host + ":8081/analytics/query"
        return self.do_post(url, post_data)

    def do_get(self, url):
        request = urllib2.Request(url)
        request.add_header("Content-Type", "application/json")
        request.add_header("charset", "UTF-8")
        request.add_header("X-Contrail-Useragent", "%s:%s" % (platform.node(), "contrail_utils"))
        request.add_header("X-Auth-Token", self._auth_token)
        request.get_method = lambda: 'GET'
        result = urllib2.urlopen(request)
        return result.read()

    def do_post(self, url, data):
        request = urllib2.Request(url)
        request.add_header("Content-Type", "application/json")
        request.add_header("charset", "UTF-8")
        request.add_header("X-Contrail-Useragent", "%s:%s" % (platform.node(), "contrail_utils"))
        request.add_header("Content-Length", len(data))
        request.add_header("X-Auth-Token", self._auth_token)
        result = urllib2.urlopen(request, data)
        return result.read()

    def do_put(self, url, data=""):
        request = urllib2.Request(url)
        request.add_header("Content-Type", "application/json")
        request.add_header("charset", "UTF-8")
        request.add_header("X-Contrail-Useragent", "%s:%s" % (platform.node(), "contrail_utils"))
        request.add_header("X-Auth-Token", self._auth_token)
        request.get_method = lambda: 'PUT'

        if data == "":
            result = urllib2.urlopen(request)
        else:
            result = urllib2.urlopen(request, data)

        return result.read()

    def do_nova_delete(self, url, project_name, data=""):
        project_token = self.get_project_auth_token(project_name)
        request = urllib2.Request(url)
        request.add_header("Content-Type", "application/json")
        request.add_header("charset", "UTF-8")
        request.add_header("X-Contrail-Useragent", "%s:%s" % (platform.node(), "contrail_utils"))
        request.add_header("X-Auth-Token", project_token)
        request.get_method = lambda: 'DELETE'

        if data == "":
            result = urllib2.urlopen(request)
        else:
            result = urllib2.urlopen(request, data)

        return result.read()

    def do_delete(self, url, data=""):
        request = urllib2.Request(url)
        request.add_header("Content-Type", "application/json")
        request.add_header("charset", "UTF-8")
        request.add_header("X-Contrail-Useragent", "%s:%s" % (platform.node(), "contrail_utils"))
        request.add_header("X-Auth-Token", self._auth_token)
        request.get_method = lambda: 'DELETE'

        if data == "":
            result = urllib2.urlopen(request)
        else:
            result = urllib2.urlopen(request, data)

        return result.read()

    def create_glance_url(self, url):
        return "http://" + self._host + self._glance_url + url

    def create_heat_url(self, url):
        if not url.startswith("/"):
            url = "/" + url

        return "http://" + self._host + self._heat_url + url

    def list_glance_images(self):
        url = self.create_glance_url('/images')
        print url
        return self.do_get(url)

    def reserve_image_old(self, name):
        data = urllib.urlencode([("name", name)])
        print data
        url = self.create_glance_url('/images')
        print url
        request = urllib2.Request(url)
        request.add_header("X-Auth-Token", self._auth_token)
        request.add_header("x-image-meta-name", name)
        request.add_header("Content-Length", len(data))
        request.add_header("x-image-meta-disk_format", "qcow2")
        request.add_header("x-image-meta-container_format", "bare")
        print str(request)
        result = urllib2.urlopen(request, data)
        return result.read()

    def reserve_image_broken(self, name):

        data = """{
            "name": %s,
            "visibility": "Public",
            "container_format": "bare",
            "disk_format": "qcow2",
            "min_disk": "2",
            "min_ram": "2048"
        }""" % name

        print data
        url = self.create_glance_url('/images')
        print url
        request = urllib2.Request(url)
        request.add_header("X-Auth-Token", self._auth_token)
        request.add_header("Content-Length", len(data))
        result = urllib2.urlopen(request, data)
        return result.read()

    def upload_image(self, name, image_file_path):

        url = self.create_glance_url('/images')

        try:
            f = open(image_file_path, 'rb')
            fio = mmap.mmap(f.fileno(), 0, access=mmap.ACCESS_READ)

            request = urllib2.Request(url, fio)
            request.add_header("X-Auth-Token", self._auth_token)
            request.add_header("Content-Type", "application/octet-stream")
            request.add_header("x-image-meta-name", name)
            request.add_header("x-image-meta-disk_format", "qcow2")
            request.add_header("x-image-meta-container_format", "bare")
            request.add_header("x-image-meta-is_public", "true")
            request.add_header("x-image-meta-min_ram", "2048")
            request.add_header("x-image-meta-min_disk", "2")
            result = urllib2.urlopen(request)
            return result.read()
        except Exception as e:
            print str(e)

        finally:
            fio.close()
            f.close()

    def post_heat_template(self, tenant_id, stack_name, template_string):
        print "HEHEHEHEHEHEHEHEHEH"
        url = self.create_heat_url("/" + str(tenant_id) + "/stacks")
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
        return self.do_post(url, data)


if __name__ == '__main__':
    print "Contrail utility library"
