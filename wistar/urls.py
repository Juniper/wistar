from django.conf.urls import include, url

import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^topologies/', include('topologies.urls', namespace="topologies")),
    url(r'^images/', include('images.urls', namespace="images")),
    url(r'^ajax/', include('ajax.urls', namespace="ajax")),
    url(r'^webConsole/', include('webConsole.urls', namespace="webConsole")),
    url(r'^scripts/', include('scripts.urls', namespace="scripts")),
    url(r'^api/', include('api.urls', namespace="api")),
]
