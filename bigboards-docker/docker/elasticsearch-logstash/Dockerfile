FROM bigboards/java-7-armv7l

MAINTAINER bigboards

USER root

# Install LogStash.
RUN \
  cd / && \
  wget https://download.elasticsearch.org/logstash/logstash/logstash-1.4.2.tar.gz && \
  tar xzf logstash-1.4.2.tar.gz && \
  rm -f logstash-1.4.2.tar.gz && \
  mv /logstash-1.4.2 /logstash

#         ES
#     +---------+
EXPOSE 9200 9300

CMD ["/elasticsearch/bin/elasticsearch"]