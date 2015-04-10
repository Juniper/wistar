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
    template = forms.CharField(widget=forms.Textarea(attrs={'rows': '20', 'title' : 'Configuration Template' })) 

    class Meta:
        model = ConfigTemplate
        fields = ['name', 'description', 'template']

class ConfigTemplateUpdate(UpdateView):
    model = ConfigTemplate
    fields = ['name', 'description', 'template']
    template_name_suffix = '_update_form'
