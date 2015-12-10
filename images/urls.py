from django.conf.urls import patterns, url

from images import views


urlpatterns = patterns('',
                       url(r'^$', views.index, name='index'),
                       url(r'^new/$', views.new, name='new'),
                       url(r'^blank/$', views.blank, name='blank'),
                       url(r'^local/$', views.local, name='local'),
                       url(r'^create/$', views.create, name='create'),
                       url(r'^createBlank/$', views.create_blank, name='create_blank'),
                       url(r'^createLocal/$', views.create_local, name='create_local'),
                       url(r'^blockPull/(?P<uuid>[^/]+)$', views.block_pull,
                           name='block_pull'),
                       url(r'^createFromInstance/(?P<uuid>[^/]+)$', views.create_from_instance,
                           name='create_from_instance'),
                       url(r'^update/$', views.update, name='update'),
                       url(r'^edit/(?P<image_id>\d+)/$', views.edit, name='edit'),
                       url(r'^error/$', views.error, name='error'),
                       url(r'^delete/(?P<image_id>\d+)/$', views.delete, name='delete'),
                       url(r'^(?P<image_id>\d+)$', views.detail, name='detail'),
                       )
