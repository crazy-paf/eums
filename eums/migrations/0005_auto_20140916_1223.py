# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('eums', '0004_auto_20140916_1028'),
    ]

    operations = [
        migrations.CreateModel(
            name='DistributionPlanLineItem',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('quantity', models.IntegerField()),
                ('under_current_supply_plan', models.BooleanField(default=True)),
                ('planned_distribution_date', models.DateField()),
                ('destination_location', models.CharField(max_length=255)),
                ('remark', models.TextField()),
                ('consignee', models.ForeignKey(to='eums.Consignee')),
                ('item', models.ForeignKey(to='eums.Item')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.RemoveField(
            model_name='distributionplanitem',
            name='consignee',
        ),
        migrations.RemoveField(
            model_name='distributionplanitem',
            name='item',
        ),
        # migrations.DeleteModel(
        #     name='DistributionPlanItem',
        # ),
        migrations.AlterField(
            model_name='distributionplan',
            name='line_items',
            field=models.ManyToManyField(to=b'eums.DistributionPlanLineItem'),
        ),
    ]
