#!/bin/bash
IFS='/' read -a array <<< "$1"
if [ "${array[@]}" -eq "2" ]; then
BRANCH="${array[2]}"
else
BRANCH="$1"
fi

deb-s3 upload -p -b apt.bigboards.io --arch armv7l -c $BRANCH --access-key-id=$2 --secret-access-key=$3 bigboards-cli/target/*.deb
deb-s3 upload -p -b apt.bigboards.io --arch armhf -c $BRANCH --access-key-id=$2 --secret-access-key=$3 bigboards-cli/target/*.deb
deb-s3 upload -p -b apt.bigboards.io --arch x86_64 -c $BRANCH --access-key-id=$2 --secret-access-key=$3 bigboards-cli/target/*.deb

deb-s3 upload -p -b apt.bigboards.io --arch armv7l -c $BRANCH --access-key-id=$2 --secret-access-key=$3 bigboards-mmc/target/*.deb
deb-s3 upload -p -b apt.bigboards.io --arch armhf -c $BRANCH --access-key-id=$2 --secret-access-key=$3 bigboards-mmc/target/*.deb
deb-s3 upload -p -b apt.bigboards.io --arch x86_64 -c $BRANCH --access-key-id=$2 --secret-access-key=$3 bigboards-mmc/target/*.deb

deb-s3 upload -p -b apt.bigboards.io --arch armv7l -c $BRANCH --access-key-id=$2 --secret-access-key=$3 bigboards-updater/target/*.deb
deb-s3 upload -p -b apt.bigboards.io --arch armhf -c $BRANCH --access-key-id=$2 --secret-access-key=$3 bigboards-updater/target/*.deb
deb-s3 upload -p -b apt.bigboards.io --arch x86_64 -c $BRANCH --access-key-id=$2 --secret-access-key=$3 bigboards-updater/target/*.deb