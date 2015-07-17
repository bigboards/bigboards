FROM bigboards/elasticsearch-armv7l

MAINTAINER bigboards

USER root

# Install Kibana.
RUN \
  cd / && \
  wget https://download.elasticsearch.org/kibana/kibana/kibana-3.1.2.tar.gz && \
  tar xzf kibana-3.1.2.tar.gz && \
  rm -f kibana-3.1.2.tar.gz && \
  mv /kibana-3.1.2 /kibana

# Install NGINX
RUN \
  apt-get install -y nginx-full

#         ES
#     +---------+
EXPOSE 9200 9300

CMD ["/elasticsearch/bin/elasticsearch"]