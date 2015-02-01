FROM bigboards/base-armv7l

MAINTAINER bigboards

USER root

RUN apt-get update && apt-get install -y libcurl3 libfcgi0ldbl libyajl2 libltdl7

ADD sx_1.0-1_armhf.deb /tmp/sx_1.0-1_armhf.deb
RUN dpkg -i /tmp/sx_1.0-1_armhf.deb

#       http
#     +------+
EXPOSE 80 443

CMD ["/bin/bash"]