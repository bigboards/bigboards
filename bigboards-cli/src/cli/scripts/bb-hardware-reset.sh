#!/bin/bash

DIR=$(dirname "$(readlink -f ${BASH_SOURCE[0]})" )

ansible-playbook ${DIR}/../ansible/hardware/reset/main.yml