# Builds Wistar from git based on an Ubuntu image
# docker run -d --privileged -p 80:80 -v /opt/wistar/user_images:/opt/wistar/user_images -v /var/run/libvirt:/var/run/libvirt --name wistar01 juniper/wistar
FROM ubuntu:16.04

ENV DEBIAN_FRONTEND=noninteractive

# Optional if you have apt cache in your lab
# RUN echo 'Acquire::HTTP::Proxy "http://10.86.9.12:3142";' >> /etc/apt/apt.conf.d/01proxy \
# && echo 'Acquire::HTTPS::Proxy "false";' >> /etc/apt/apt.conf.d/01proxy

RUN apt-get update
RUN apt-get install -y build-essential libxml2-dev libxslt1-dev libz-dev libffi-dev \
    libssl-dev python-dev git python-pip
RUN pip install cryptography junos-eznc jxmlease pyvbox
RUN apt-get install -y qemu-kvm libvirt-bin socat python-pexpect python-libvirt \
    python-yaml unzip bridge-utils python-numpy genisoimage python-netaddr \
    python-markupsafe python-setuptools mtools
RUN pip install django==1.9.9
RUN mkdir -p /opt/wistar/user_images/instances
RUN mkdir -p /opt/wistar/media
RUN mkdir -p /opt/wistar/seeds
WORKDIR /opt/wistar
RUN git clone https://github.com/Juniper/wistar.git --depth=1
RUN /opt/wistar/wistar/manage.py migrate
EXPOSE 80
ENTRYPOINT /opt/wistar/wistar/manage.py runserver 0.0.0.0:80