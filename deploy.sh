#!/bin/bash
deb-s3 upload -p -b apt.bigboards.io -c $1 --access-key-id=$2 --secret-access-key=$3 bigboards-cli/target/dist/*.deb
deb-s3 upload -p -b apt.bigboards.io -c $1 --access-key-id=$2 --secret-access-key=$3 bigboards-mmc/target/dist/*.deb
deb-s3 upload -p -b apt.bigboards.io -c $1 --access-key-id=$2 --secret-access-key=$3 bigboards-updater/target/dist/*.deb
