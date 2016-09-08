import graphene

import streams.schema


class Query(streams.schema.Query):
    # This class will inherit from multiple Queries
    # as we begin to add more apps to our project
    pass

schema = graphene.Schema(name='Stream Schema')
schema.query = Query
