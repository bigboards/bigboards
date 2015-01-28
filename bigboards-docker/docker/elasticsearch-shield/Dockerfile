FROM bigboards/elasticsearch-armv7l

MAINTAINER bigboards

USER root

RUN /elasticsearch/bin/plugin -i elasticsearch/license/latest
RUN /elasticsearch/bin/plugin -i elasticsearch/shield/latest

#         ES
#     +---------+
EXPOSE 9200 9300

CMD ["/elasticsearch/bin/elasticsearch"]
