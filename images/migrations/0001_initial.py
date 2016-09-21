# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Image',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=32)),
                ('type', models.CharField(default=b'junos_vmx', max_length=32, choices=[(b'blank', b'Blank'), (b'linux', b'Linux'), (b'junos_vmx', b'Junos vMX Phase 1'), (b'junos_vre', b'Junos vMX RE'), (b'junos_vpfe', b'Junos vMX vFPC'), (b'junos_vpfe_haswell', b'Junos vMX vFPC (Haswell)'), (b'junos_vqfx_re', b'Junos vQFX RE'), (b'junos_vqfx_cosim', b'Junos vQFX Cosim'), (b'generic', b'Other'), (b'junos_firefly', b'Junos vSRX 1.0'), (b'junos_vsrx', b'Junos vSRX'), (b'junos_vmx_hdd', b'Junos vMX HDD'), (b'space', b'Junos Space')])),
                ('description', models.TextField()),
                ('filePath', models.FileField(upload_to=b'user_images')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Images',
                'verbose_name_plural': 'images',
            },
            bases=(models.Model,),
        ),
    ]
