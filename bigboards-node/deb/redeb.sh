#!/usr/bin/env bash

# IMPORTANT
# Protect against misspelling a var and rm -rf /
set -u
set -e

PROJECT_NAME=bigboards-node
PROJECT_VERSION=1.0.$(date +"%Y%m%d%H%M")

PROJECT_HOME=${1}
SRC="/tmp/${PROJECT_NAME}-deb-src"
DIST="${PROJECT_HOME}/target/dist"
SYSROOT=${SRC}/sysroot
DEBIAN=${SRC}/DEBIAN

rm -rf ${DIST}
mkdir -p ${DIST}/

rm -rf ${SRC}
rsync -a ${PROJECT_HOME}/deb/src/ ${SRC}/
mkdir -p ${SYSROOT}/opt/

mkdir -p ${SYSROOT}/opt/bb/runtimes/${PROJECT_NAME}/
rsync -arvv ${PROJECT_HOME}/src/main/ ${SYSROOT}/opt/bb/runtimes/${PROJECT_NAME}/ --delete
# In case of a NodeJS project we separately copy the packaje.json file; comment or uncomment wether applicable
rsync -arvv ${PROJECT_HOME}/package.json ${SYSROOT}/opt/bb/runtimes/${PROJECT_NAME}/ --delete

find ${SRC}/ -type d -exec chmod 0755 {} \;
find ${SRC}/ -type f -exec chmod go-w {} \;
# chown 0:0 to make sure we install under root which is always known at the install site;
# => run script as sudo
# However, this makes the maven build fail as our normal user can not delete the root owned files and folders
#chown -R 0:0 ${SRC}

SIZE=`du -s ${SYSROOT} | cut -f1`
pushd ${SYSROOT}/
tar czf ${DIST}/data.tar.gz [a-z]*
popd
echo "sed -e s\"/SIZE/${SIZE}/\" -i \"\" ${DEBIAN}/control"

if [ "$(uname)" == "Linux" ];
then
    sed -e s"/SIZE/${SIZE}/" -i"" ${DEBIAN}/control
    sed -e s"/VERSION/${PROJECT_VERSION}/" -i"" ${DEBIAN}/control
else
    sed -e s"/SIZE/${SIZE}/" -i "" ${DEBIAN}/control
    sed -e s"/VERSION/${PROJECT_VERSION}/" -i "" ${DEBIAN}/control
fi

pushd ${DEBIAN}
tar czf ${DIST}/control.tar.gz *
popd

pushd ${DIST}/
echo 2.0 > ./debian-binary

find ${DIST}/ -type d -exec chmod 0755 {} \;
find ${DIST}/ -type f -exec chmod go-w {} \;
# chown 0:0 to make sure we install under root which is always known at the install site;
# => run script as sudo
# However, this makes the maven build fail as our normal user can not delete the root owned files and folders
#chown -R 0:0 ${DIST}/
ar r ${DIST}/${PROJECT_NAME}-${PROJECT_VERSION}.deb debian-binary control.tar.gz data.tar.gz
popd