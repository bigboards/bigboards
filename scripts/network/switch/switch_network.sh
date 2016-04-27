#!/bin/bash
function usage() {
    echo "${0} range mask"
    echo
    echo "    range  : the network range formatted as <1-255>.<0-255>.<0-255>"
    echo "    mask   : the netmask formatted as <1-255>.<0-255>.<0-255>.<0-255>"
    echo
}

rx='([1-9]?[0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])'

if [[ -z $1 || -z $2 ]]; then
    usage
    exit 1
fi

if [[ ! $1 =~ ^$rx\.$rx\.$rx$ ]]; then
    echo "Invalid network range!"
    echo "  expected format: <1-255>.<0-255>.<0-255>"
    usage
    exit 1
fi

if [[ ! $2 =~ ^$rx\.$rx\.$rx\.$rx$ ]]; then
    echo "Invalid network mask!"
    echo "  expected format: <1-255>.<0-255>.<0-255>.<0-255>"
    usage
    exit 1
fi

echo booo
ansible-playbook ./switch_network.yml --extra-vars "network_range=${1} network_mask=${2}"