FROM bigboards/java-7-armv7l

MAINTAINER bigboards

USER root

# Install Zookeeper.
RUN \
  apt-get update && \
  apt-get install -y zookeeper

# Define default command.
CMD ["/bin/bash"]

#  - 2181: Port used by localhost to talk to ZooKeeper.
#  - 2888: Port used for inter-zookeeper communication.
#  - 3888: Port used for inter-zookeeper communication.
EXPOSE 2181 2888 3888