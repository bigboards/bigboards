#!/bin/bash
BRANCH="$BUILDKITE_BRANCH"
export AWS_PROFILE=personal

COMPONENT="unstable"
if [[ $BUILDKITE_TAG == release* ]]; then
    COMPONENT="main"
    BRANCH=$(echo $BUILDKITE_TAG| cut -d'-' -f 2)
    BRANCH=${BRANCH/_/.}
fi

[ -z $BRANCH ] && echo "No branch defined!" && exit 1
[ -z $COMPONENT ] && echo "No component defined!" && exit 1

deb-s3 upload -p -b apt.bigboards.io -a armv7l -c $BRANCH -m $COMPONENT bigboards-cli/target/*.deb
deb-s3 upload -p -b apt.bigboards.io -a armhf -c $BRANCH -m $COMPONENT bigboards-cli/target/*.deb
deb-s3 upload -p -b apt.bigboards.io -a amd64 -c $BRANCH -m $COMPONENT bigboards-cli/target/*.deb

deb-s3 upload -p -b apt.bigboards.io -a armv7l -c $BRANCH -m $COMPONENT bigboards-mmc/target/*.deb
deb-s3 upload -p -b apt.bigboards.io -a armhf -c $BRANCH -m $COMPONENT bigboards-mmc/target/*.deb
deb-s3 upload -p -b apt.bigboards.io -a amd64 -c $BRANCH -m $COMPONENT bigboards-mmc/target/*.deb

deb-s3 upload -p -b apt.bigboards.io -a armv7l -c $BRANCH -m $COMPONENT bigboards-updater/target/*.deb
deb-s3 upload -p -b apt.bigboards.io -a armhf -c $BRANCH -m $COMPONENT bigboards-updater/target/*.deb
deb-s3 upload -p -b apt.bigboards.io -a amd64 -c $BRANCH -m $COMPONENT bigboards-updater/target/*.deb