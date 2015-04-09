from django.conf.urls import patterns, url

from templates import views


urlpatterns = patterns('',
                       url(r'^$', views.index, name='index'),
                       url(r'^new/$', views.new, name='new'),
                       url(r'^create/$', views.create, name='create'),
                       url(r'^update/$', views.update, name='update'),
                       url(r'^error/$', views.error, name='error'),
                       url(r'^delete/(?P<template_id>\d+)/$', views.delete, name='delete'),
                       url(r'^(?P<template_id>\d+)$', views.detail, name='detail'),
                       url(r'^edit/(?P<template_id>\d+)/$', views.edit, name='edit'),
                       )
