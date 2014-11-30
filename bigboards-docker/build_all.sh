#!/bin/bash
# Fail on error
set -e

DOCKER_USER=bigboards
DOCKER_PASSWORD=9jUlOzHTol14
DOCKER_EMAIL=hello@bigboards.io

REPOSITORIES="base java-7 nodejs hadoop"
DOCKER="/usr/bin/docker"

echo "Logging into the docker hub"
${DOCKER} login -e ${DOCKER_EMAIL} -u ${DOCKER_USER} -p ${DOCKER_PASSWORD}

for REPO in ${REPOSITORIES}
do
    ./build ${REPO}
done

