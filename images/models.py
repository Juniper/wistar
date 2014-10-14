from django.db import models
from django.forms import ModelForm

class Image(models.Model):
    type_choices = (('junos', 'Junos'), ('linux', 'Linux'), ('other', 'Other'))
    name = models.CharField(max_length=32)
    type = models.CharField(max_length=32, choices=type_choices, default='junos')
    path = models.CharField(max_length=256)
    description = models.TextField()
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True, auto_now_add=True)
    
    class Meta:
      verbose_name = 'Images'
      verbose_name_plural = 'images'

class ImageForm(ModelForm):
    class Meta:
        model = Image
        fields = ['name', 'type', 'path', 'description']
