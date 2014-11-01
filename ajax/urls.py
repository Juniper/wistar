from django.conf.urls import patterns, url
from ajax import views

urlpatterns = patterns('',
    url(r'^$', views.index, name='index'),
    url(r'^configJunosInterfaces/$', views.configJunosInterfaces, name='configJunosInterfaces'),
    url(r'^preconfigJunosDomain/$', views.preconfigJunosDomain, name='preconfigJunosDomain'),
    url(r'^getJunosConfig/$', views.getJunosConfig, name='getJunosConfig'),
    url(r'^getJunosStartupState/$', views.getJunosStartupState, name='getJunosStartupState'),
    url(r'^syncLinkData/$', views.syncLinkData, name='syncLinkData'),
)
