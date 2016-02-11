from django.db import models
from django.forms import ModelForm
from django.forms import widgets
from django import forms
from wistar import settings


class Image(models.Model):
    type_choices = (('junos_vmx', 'Junos vMX Phase 1'), ('junos_vmx_p2', 'Junos vMX Phase 2'),
                    ('junos_vmx_p3', 'Junos vMX Phase 3'),
                    ('junos_firefly', 'Junos vSRX'), ('junos', 'Junos Other'),
                    ('linux', 'Linux'), ('other', 'Other'),
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
    size = forms.CharField(max_length=32, label="Size (GB):",
                           widget=forms.TextInput(attrs={'onblur': 'javascript: return numeric_only(this);'}))

    class Meta:
        model = Image
        fields = ['name', 'size', 'description']
        widgets = {'name': widgets.TextInput(attrs={'onblur': 'javascript: return clean_string_no_space(this);'})}


class ImageLocalForm(ModelForm):

    class Meta:
        model = Image
        fields = ['name', 'type', 'filePath', 'description']
        widgets = {'name': widgets.TextInput(attrs={'onblur': 'javascript: return clean_string_no_space(this);'}),
                   'filePath': widgets.TextInput(attrs={'value': settings.MEDIA_ROOT + '/user_images/'})}
