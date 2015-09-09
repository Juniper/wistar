from django.db import models
from django import forms
from django.forms import ModelForm
from django.views.generic.edit import UpdateView


class ConfigTemplate(models.Model):
    name = models.CharField(max_length=32)
    description = models.TextField()
    template = models.TextField()
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True, auto_now_add=True)

    class Meta:
        verbose_name = 'ConfigTemplate'
        verbose_name_plural = 'configTemplates'


class ConfigTemplateForm(ModelForm):
    description = forms.CharField(widget=forms.Textarea(attrs={'rows': '2'})) 
    template = forms.CharField(widget=forms.Textarea(attrs={'rows': '20', 'title': 'Configuration Template' }))

    class Meta:
        model = ConfigTemplate
        fields = ['name', 'description', 'template']


class ConfigTemplateUpdate(UpdateView):
    model = ConfigTemplate
    fields = ['name', 'description', 'template']
    template_name_suffix = '_update_form'


class Script(models.Model):
    type_choices = (('ssh', 'SSH'), ('netconf', 'NetConf'), ('console', 'Console'))

    name = models.CharField(max_length=32)
    description = models.TextField()
    script = models.TextField()
    type = models.CharField(max_length=32, choices=type_choices, default='netconf')
    destination = models.CharField(max_length=256)
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True, auto_now_add=True)

    class Meta:
        verbose_name = 'script'
        verbose_name_plural = 'scripts'


class ScriptForm(ModelForm):
    description = forms.CharField(widget=forms.Textarea(attrs={'rows': '3'}))
    script = forms.CharField(widget=forms.Textarea(attrs={'rows': '40', 'title': 'Script'}))

    class Meta:
        model = Script
        fields = ['name', 'description',  'destination', 'type', 'script']


class ScriptUpdate(UpdateView):
    model = Script
    fields = ['name', 'description', 'destination', 'script']
    template_name_suffix = '_update_form'