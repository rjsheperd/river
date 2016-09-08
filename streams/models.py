from __future__ import unicode_literals

from django.db import models
from django.contrib.auth.models import User


class Stream(models.Model):
    name = models.CharField(max_length=100)
    notes = models.TextField(blank=True)
    users = models.ManyToManyField(User, related_name='streams')

    class Meta:
        ordering = ('name', )


class Task(models.Model):
    name = models.CharField(max_length=100)
    stream = models.ForeignKey(Stream, related_name='tasks')
    order = models.IntegerField(default=0, blank=False)

    class Meta:
        ordering = ('order', )
