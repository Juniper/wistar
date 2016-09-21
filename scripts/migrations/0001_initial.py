# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='ConfigTemplate',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=32)),
                ('description', models.TextField()),
                ('template', models.TextField()),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'ConfigTemplate',
                'verbose_name_plural': 'configTemplates',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Script',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=32)),
                ('description', models.TextField()),
                ('script', models.TextField()),
                ('type', models.CharField(default=b'netconf', max_length=32, choices=[(b'ssh', b'SSH'), (b'netconf', b'NetConf'), (b'console', b'Console')])),
                ('destination', models.CharField(max_length=256)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'script',
                'verbose_name_plural': 'scripts',
            },
            bases=(models.Model,),
        ),
    ]
