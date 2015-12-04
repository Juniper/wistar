from django.db import models
from django.forms import ModelForm
from django.forms import widgets
from django import forms


class Image(models.Model):
    type_choices = (('junos_vmx', 'Junos vMX <= 14.1'), ('junos_firefly', 'Junos Firefly'), ('junos', 'Junos Other'),
                    ('linux', 'Linux'), ('other', 'Other'), ('junos_vmx_p2', 'Junos vMX >= 14.2'),
                    ('vpfe', 'Virtual PFE'), ('blank', 'Blank Image'))
    name = models.CharField(max_length=32)
    type = models.CharField(max_length=32, choices=type_choices, default='junos_vmx')
    description = models.TextField()
    filePath = models.FileField(upload_to='user_images')
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Images'
        verbose_name_plural = 'images'


class ImageForm(ModelForm):
    class Meta:
        model = Image
        fields = ['name', 'type', 'filePath', 'description']


class ImageBlankForm(ModelForm):
    size = forms.CharField(max_length=32, label="Size (GB):")

    class Meta:
        model = Image
        fields = ['name', 'size', 'description']
        widgets = {'name': widgets.TextInput(attrs={'onblur': 'javascript: return clean_string_no_space(this);'})}
