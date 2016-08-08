#!/bin/bash
BRANCH="$BUILDKITE_BRANCH"
export AWS_PROFILE=personal

COMPONENT="unstable"
[ "$1" = "release" ] && COMPONENT="main"

echo "deb-s3 upload -p -b apt.bigboards.io -a armv7l -c $BRANCH -m $COMPONENT bigboards-cli/target/*.deb"
echo "deb-s3 upload -p -b apt.bigboards.io -a armhf -c $BRANCH -m $COMPONENT bigboards-cli/target/*.deb"
echo "deb-s3 upload -p -b apt.bigboards.io -a amd64 -c $BRANCH -m $COMPONENT bigboards-cli/target/*.deb"

echo "deb-s3 upload -p -b apt.bigboards.io -a armv7l -c $BRANCH -m $COMPONENT bigboards-mmc/target/*.deb"
echo "deb-s3 upload -p -b apt.bigboards.io -a armhf -c $BRANCH -m $COMPONENT bigboards-mmc/target/*.deb"
echo "deb-s3 upload -p -b apt.bigboards.io -a amd64 -c $BRANCH -m $COMPONENT bigboards-mmc/target/*.deb"

echo "deb-s3 upload -p -b apt.bigboards.io -a armv7l -c $BRANCH -m $COMPONENT bigboards-updater/target/*.deb"
echo "deb-s3 upload -p -b apt.bigboards.io -a armhf -c $BRANCH -m $COMPONENT bigboards-updater/target/*.deb"
echo "deb-s3 upload -p -b apt.bigboards.io -a amd64 -c $BRANCH -m $COMPONENT bigboards-updater/target/*.deb"