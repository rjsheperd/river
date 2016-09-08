from __future__ import unicode_literals

from django.db import models

# Create your models here.
class Category(models.Model):
    name = models.CharField(max_length=100)
    icon = models.ImageField()

    class Meta:
        ordering = ('name', )


class Service(models.Model):
    name = models.CharField(max_length=100)
    url = models.URLField()
    icon = models.ImageField()

    class Meta:
        ordering = ('name', )
