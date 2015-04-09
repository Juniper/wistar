class WistarException(Exception):
    """ Simple exception to catch
        application related exceptions
    """
    def __get_message(self):
        return self.__message

    def __set_message(self, message):
        self._message = message
    message = property(__get_message, __set_message)

