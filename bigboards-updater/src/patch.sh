#!/bin/bash
[ -z $1 ] && echo -e "No patch identifier has been given. Please provide one as 1st parameter!" && exit 1
PATCH=$1

ANSIBLE_ERROR_ON_UNDEFINED_VARS=True ansible-playbook -i /opt/bb/hosts /opt/bb/runtimes/bigboards-updater/${PATCH}/install.yml && echo $1 > /opt/bb/.version
