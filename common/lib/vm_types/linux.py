from base_vm import BaseVM


class Linux(BaseVM):

    type_name = "Linux VM"
    type_description = "Generic Linux VM"
    cloud_init = True
