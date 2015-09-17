#!/bin/bash
[ -z $1 ] && echo -e "No patch identifier has been given. Please provide one as 1st parameter!" && exit 1
PATCH=$1

HOSTSFILE=/opt/bb/hosts
[ ! -f "$HOSTSFILE" ] && HOSTSFILE=/etc/ansible/hosts

ANSIBLE_ERROR_ON_UNDEFINED_VARS=True ansible-playbook -i ${HOSTSFILE} /opt/bb/runtimes/bigboards-updater/patches/${PATCH}/install.yml && echo $1 "|" $(date) >> /opt/bb/.versions
