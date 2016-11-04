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
