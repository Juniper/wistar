# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Config',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.TextField()),
                ('type', models.TextField()),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('ip', models.GenericIPAddressField()),
                ('deviceConfig', models.TextField()),
                ('password', models.TextField()),
            ],
            options={
                'verbose_name': 'Config',
                'verbose_name_plural': 'configs',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='ConfigSet',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.TextField()),
                ('description', models.TextField()),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'ConfigSet',
                'verbose_name_plural': 'configSets',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Topology',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('description', models.TextField(default=b'none', verbose_name=b'Description')),
                ('name', models.TextField(default=b'noname', verbose_name=b'name')),
                ('json', models.TextField(verbose_name=b'json')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True, verbose_name=b'modified')),
            ],
            options={
                'verbose_name': 'Topology',
                'verbose_name_plural': 'topologies',
            },
            bases=(models.Model,),
        ),
        migrations.AddField(
            model_name='configset',
            name='topology',
            field=models.ForeignKey(to='topologies.Topology'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='config',
            name='configSet',
            field=models.ForeignKey(to='topologies.ConfigSet'),
            preserve_default=True,
        ),
    ]
