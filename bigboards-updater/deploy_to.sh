#!/usr/bin/env bash
HEX_NAME=$1

scp -r ./src/ansible/* bb@${HEX_NAME}.hex.bigboards.io:/opt/bb/runtimes/bigboards-updater/patches