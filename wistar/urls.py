from django.conf.urls import patterns, include, url

from django.contrib import admin
import views

admin.autodiscover()

urlpatterns = patterns('',
    url(r'^$', views.index, name='index'),
    url(r'^topologies/', include('topologies.urls', namespace="topologies")),
    url(r'^images/', include('images.urls', namespace="images")),
    url(r'^admin/', include(admin.site.urls)),
)
