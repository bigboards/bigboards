#!/bin/bash
deb-s3 upload -p -b apt.bigboards.io --arch armv7l -c $1 --access-key-id=$2 --secret-access-key=$3 bigboards-cli/target/*.deb
deb-s3 upload -p -b apt.bigboards.io --arch armv7l -c $1 --access-key-id=$2 --secret-access-key=$3 bigboards-mmc/target/*.deb
deb-s3 upload -p -b apt.bigboards.io --arch armv7l -c $1 --access-key-id=$2 --secret-access-key=$3 bigboards-updater/target/*.deb
