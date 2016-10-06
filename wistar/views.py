import logging

from django.http import HttpResponseRedirect

logger = logging.getLogger(__name__)


def index(request):
    logger.debug("Redirecting to /topologies")
    return HttpResponseRedirect('/topologies/')
