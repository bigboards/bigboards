#!/bin/bash
# Fail on error
set -e

DOCKER_USER=bigboards
DOCKER_PASSWORD=9jUlOzHTol14
DOCKER_EMAIL=hello@bigboards.io

DOCKER_DIR="./docker"
ARCH=$(uname -m)
FORCE_LATEST="Y"
DOCKER="/usr/bin/docker"

sed -i -- "s/__arch__/${ARCH}/g" ${DOCKER_DIR}/base-${ARCH}/Dockerfile

echo "Logging into the docker hub"
${DOCKER} login -e ${DOCKER_EMAIL} -u ${DOCKER_USER} -p ${DOCKER_PASSWORD}

if [ "${FORCE_LATEST}" = "Y" ]
then
    VERSION="latest"
else
    VERSION=$(cat ${DOCKER_DIR}/base-${ARCH}/version)
fi

IMAGE_NAME="bigboards/base-${ARCH}:${VERSION}"

echo "Building ${IMAGE_NAME}"
sudo -E ${DOCKER} build -t ${IMAGE_NAME} ${DOCKER_DIR}/base-${ARCH}

echo "Pushing ${IMAGE_NAME}"
sudo -E ${DOCKER} push ${IMAGE_NAME}

