from django.db import models


class ItemUnit(models.Model):
    name = models.CharField(max_length=255)

    class Meta:
        app_label = 'eums'
