from django.db import models

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

class Lab(models.Model):
    topology = models.ForeignKey('Topology')
    name = models.TextField()
    description = models.TextField()
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True, auto_now_add=True)

    class Meta:
      verbose_name_plural = 'labs'

class Device(models.Model):
    labs = models.ManyToManyField('Lab')
    name = models.TextField()
    model = models.TextField()
    type = models.TextField()
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True, auto_now_add=True)
    ipaddress = models.IPAddressField(db_index=True)


