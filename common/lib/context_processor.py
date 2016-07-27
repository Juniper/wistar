import os
from wistar import configuration


# custom request processor that adds the os load to every request
def add_load(request):
    (one, five, ten) = os.getloadavg()
    load = {'one': one, 'five': five, 'ten': ten}
    return {'load': load, 'global_config': configuration}

