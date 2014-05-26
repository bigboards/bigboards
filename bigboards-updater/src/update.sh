#!/bin/bash
ANSIBLE_ERROR_ON_UNDEFINED_VARS=True ansible-playbook -i /opt/bb/runtimes/bigboards-updater/hosts $@ /opt/bb/runtimes/bigboards-updater/update.yml
