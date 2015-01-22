FROM bigboards/java-7-armv7l

MAINTAINER bigboards

USER root

# install curl
RUN apt-get update && apt-get install -y curl

RUN curl -o /tmp/elasticsearch-1.4.2.deb https://download.elasticsearch.org/elasticsearch/elasticsearch/elasticsearch-1.4.2.deb
RUN dpkg -i /tmp/elasticsearch-1.4.2.deb

#         ES
#     +---------+
EXPOSE 9200 9300

CMD ["/usr/share/elasticsearch/bin/elasticsearch"]