from django.db import models
from django.forms import ModelForm

# Create your models here.

class Topology(models.Model):
    description = models.TextField(default="none", verbose_name="Description")
    name = models.TextField(default="noname", verbose_name="name")
    json = models.TextField(verbose_name="json")
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(verbose_name="modified", auto_now=True, auto_now_add=True)

    class Meta:
      verbose_name = 'Topology'
      verbose_name_plural = 'topologies'

class ConfigSet(models.Model):
    topology = models.ForeignKey('Topology')
    name = models.TextField()
    description = models.TextField()
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True, auto_now_add=True)

    class Meta:
      verbose_name = 'ConfigSet'
      verbose_name_plural = 'configSets'

class Config(models.Model):
    configSet = models.ForeignKey('ConfigSet')
    name = models.TextField()
    type = models.TextField()
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True, auto_now_add=True)
    ip = models.IPAddressField()
    deviceConfig = models.TextField()
    password = models.TextField()
    
    class Meta:
      verbose_name = 'Config'
      verbose_name_plural = 'configs'

