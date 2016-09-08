from graphene import relay, ObjectType, Mutation
from graphene.contrib.django.filter import DjangoFilterConnectionField
from graphene.contrib.django.types import DjangoNode

from .models import Stream, Task

# Graphene will automatically map the model's fields onto the Node.
class StreamNode(DjangoNode):
    class Meta:
        model = Stream
        filter_fields = ['name', 'tasks']
        filter_order_by = ['name']


class TaskNode(DjangoNode):
    class Meta:
        model = Task
        # Allow for some more advanced filtering here
        filter_fields = {
            'name': ['exact', 'icontains', 'istartswith'],
            'stream': ['exact'],
            'stream__name': ['exact'],
        }
        filter_order_by = ['stream__name', 'order']


class Query(ObjectType):
    stream = relay.NodeField(StreamNode)
    all_streams = DjangoFilterConnectionField(StreamNode)

    task = relay.NodeField(TaskNode)
    all_tasks = DjangoFilterConnectionField(TaskNode)

    class Meta:
        abstract = True
