from django.conf.urls import patterns, url
from ajax import views

urlpatterns = patterns('',
    url(r'^$', views.index, name='index'),
    url(r'^configJunosInterfaces/$', views.configJunosInterfaces, name='configJunosInterfaces'),
    url(r'^preconfigJunosDomain/$', views.preconfigJunosDomain, name='preconfigJunosDomain'),
    url(r'^preconfigFirefly/$', views.preconfigFirefly, name='preconfigFirefly'),
    url(r'^getJunosConfig/$', views.getJunosConfig, name='getJunosConfig'),
    url(r'^getJunosStartupState/$', views.getJunosStartupState, name='getJunosStartupState'),
    url(r'^syncLinkData/$', views.syncLinkData, name='syncLinkData'),
    url(r'^refreshDeploymentStatus/$', views.refreshDeploymentStatus, name='refreshDeploymentStatus'),
    url(r'^deployTopology/$', views.deployTopology, name='deployTopology'),
    url(r'^manageDomain/$', views.manageDomain, name='manageDomain'),
    url(r'^executeCli/$', views.executeCli, name='executeCli'),
)
