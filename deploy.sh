#!/bin/bash
BRANCH="$BUILDKITE_BRANCH"
export AWS_PROFILE=personal

deb-s3 upload -p -b apt.bigboards.io -a armv7l -c $BRANCH bigboards-cli/target/*.deb
deb-s3 upload -p -b apt.bigboards.io -a armhf -c $BRANCH bigboards-cli/target/*.deb
deb-s3 upload -p -b apt.bigboards.io -a amd64 -c $BRANCH bigboards-cli/target/*.deb

deb-s3 upload -p -b apt.bigboards.io -a armv7l -c $BRANCH bigboards-mmc/target/*.deb
deb-s3 upload -p -b apt.bigboards.io -a armhf -c $BRANCH bigboards-mmc/target/*.deb
deb-s3 upload -p -b apt.bigboards.io -a amd64 -c $BRANCH bigboards-mmc/target/*.deb

deb-s3 upload -p -b apt.bigboards.io -a armv7l -c $BRANCH bigboards-updater/target/*.deb
deb-s3 upload -p -b apt.bigboards.io -a armhf -c $BRANCH bigboards-updater/target/*.deb
deb-s3 upload -p -b apt.bigboards.io -a amd64 -c $BRANCH bigboards-updater/target/*.deb
