import os

env = os.getenv('DJANGO_ENV', 'prod')

if env == 'prod':
    from .prod import *
else:
    from .dev import *
