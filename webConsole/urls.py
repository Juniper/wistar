from django.conf.urls import patterns, url

from webConsole import views


urlpatterns = patterns('',
                       url(r'^$', views.index, name='index'),
                       url(r'^(?P<port>\d+)$', views.console, name='console'),
                       )
