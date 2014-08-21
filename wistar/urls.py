from django.conf.urls import patterns, include, url

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^topologies/', include('topologies.urls', namespace="topologies")),
    url(r'^admin/', include(admin.site.urls)),
)
