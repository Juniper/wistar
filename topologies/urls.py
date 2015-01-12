from django.conf.urls import patterns, url
from topologies import views

urlpatterns = patterns('',
    url(r'^$', views.index, name='index'),
    url(r'^edit/$', views.edit, name='edit'),
    url(r'^create/$', views.create, name='create'),
    url(r'^export/(?P<topo_id>\d+)/$', views.exportTopology, name='exportTopology'),
    url(r'^import/$', views.importTopology, name='importTopology'),
    url(r'^error/$', views.error, name='error'),
    url(r'^clone/(?P<topo_id>\d+)/$', views.clone, name='clone'),
    url(r'^createConfigSet/$', views.createConfigSet, name='createConfigSet'),
    url(r'^delete/(?P<topo_id>\d+)/$', views.delete, name='delete'),
    url(r'^(?P<topo_id>\d+)/$', views.detail, name='detail'),
)
