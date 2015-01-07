FROM bigboards/base-armv7l

MAINTAINER bigboards

USER root

RUN apt-get update && apt-get install -y libcurl3 libfcgi0ldbl libyajl2

ADD sx_0.9-0.1.20141125git02f20ac-1~wheezy_armhf.deb /tmp/sx_0.9-0.1.20141125.deb
RUN dpkg -i /tmp/sx_0.9-0.1.20141125.deb

#       http
#     +------+
EXPOSE 80 443

CMD ["/bin/bash"]