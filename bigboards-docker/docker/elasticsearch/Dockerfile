#
# ElasticSearch Dockerfile
#
# Modified from https://github.com/dockerfile/elasticsearch for the BigBoards Hex.
#

# Pull base image.
FROM bigboards/java-7-armv7l

MAINTAINER bigboards
USER root
ENV ES_PKG_NAME elasticsearch-1.4.2

# install curl
RUN apt-get update && apt-get install -y wget

# Install ElasticSearch.
RUN \
  cd / && \
  wget https://download.elasticsearch.org/elasticsearch/elasticsearch/$ES_PKG_NAME.tar.gz && \
  tar xzf $ES_PKG_NAME.tar.gz && \
  rm -f $ES_PKG_NAME.tar.gz && \
  mv /$ES_PKG_NAME /elasticsearch

# Install Sigar
ADD libsigar-arm-linux.so /elasticsearch/lib/sigar/libsigar-arm-linux.so

RUN /elasticsearch/bin/plugin -i lmenezes/elasticsearch-kopf/master

# Define default command.
CMD ["/elasticsearch/bin/elasticsearch"]

# Expose ports.
#   - 9200: HTTP
#   - 9300: transport
EXPOSE 9200
EXPOSE 9300