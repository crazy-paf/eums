# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0021_noderun_status'),
    ]

    operations = [
        migrations.AddField(
            model_name='salesorderitem',
            name='description',
            field=models.CharField(default='N/A', max_length=255),
            preserve_default=False,
        ),
    ]
