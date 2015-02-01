FROM mazzolino/armhf-ubuntu:14.04

MAINTAINER bigboards

USER root

# -- create the bigboards directory structure
RUN mkdir -p /opt/bb

# -- create the bb user and bigboards group
RUN groupadd -r bigboards
RUN useradd bb -G bigboards

# -- change the permissions on the bigboards directory structure
RUN chown bb /opt/bb

# -- change the password for the bigboards user
RUN echo 'bb:Swh^bdl' | chpasswd

# -- make sure the bb user has passwordless sudo rights
RUN cp /etc/sudoers /etc/sudoers.orig && \
    sed -i -e '/Defaults\s\+env_reset/a Defaults\texempt_group=bigboards' /etc/sudoers && \
    echo '%bigboards ALL=NOPASSWD:ALL' >> /etc/sudoers

# install curl
RUN apt-get update && apt-get install -y curl

# Define default command.
CMD ["bash"]