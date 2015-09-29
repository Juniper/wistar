from django.conf.urls import patterns, url
from api import views

urlpatterns = patterns('',
                       url(r'^getTopologyStatus/$',
                           views.get_topology_status,
                           name='get_topology_status'),
                       url(r'^startTopology/$',
                           views.start_topology,
                           name='start_topology'),
                       url(r'^configureTopology/$',
                           views.configure_topology,
                           name='configure_topology'),
                       url(r'^deleteTopology/$',
                           views.delete_topology,
                           name='delete_topology'),
                       )
