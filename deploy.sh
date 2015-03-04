#!/bin/bash
deb-s3 upload -p -b bb-repo -c $1 --access-key-id=$2 --secret-access-key=$3 bigboards-*/target/dist/*.deb
