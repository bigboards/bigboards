#!/bin/bash

INT_IFACE="wlp2s0"
EXT_IFACE="wlp2s0"

TAGS="-tag hex-name=dev -tag hex-id=dev -tag arch=x86_64 -tag role=master"

INT_IFCFG="ifconfig $INT_IFACE"
INT_IP=$($INT_IFCFG | grep 'inet ' | xargs | cut -d ' ' -f 2 | cut -d ':' -f 2)
INT_BCAST=$($INT_IFCFG | grep 'inet ' | xargs | cut -d ' ' -f 3 | cut -d ':' -f 2)
INT_MASK=$($INT_IFCFG | grep 'inet ' | xargs | cut -d ' ' -f 4 | cut -d ':' -f 2)
INT_MAC=$($INT_IFCFG | grep 'HWaddr ' | xargs | cut -d ' ' -f 5)
TAGS="${TAGS} -tag network.internal=${INT_IFACE}"
TAGS="${TAGS} -tag network.${INT_IFACE}.ip=${INT_IP}"
TAGS="${TAGS} -tag network.${INT_IFACE}.netmask=${INT_BCAST}"
TAGS="${TAGS} -tag network.${INT_IFACE}.broadcast=${INT_MASK}"
TAGS="${TAGS} -tag network.${INT_IFACE}.mac=${INT_MAC}"

EXT_IFCFG="ifconfig $EXT_IFACE"
EXT_IP=$($EXT_IFCFG | grep 'inet ' | xargs | cut -d ' ' -f 2 | cut -d ':' -f 2)
EXT_BCAST=$($EXT_IFCFG | grep 'inet ' | xargs | cut -d ' ' -f 3 | cut -d ':' -f 2)
EXT_MASK=$($EXT_IFCFG | grep 'inet ' | xargs | cut -d ' ' -f 4 | cut -d ':' -f 2)
EXT_MAC=$($EXT_IFCFG | grep 'HWaddr ' | xargs | cut -d ' ' -f 5)
TAGS="${TAGS} -tag network.external=${EXT_IFACE}"
TAGS="${TAGS} -tag network.${EXT_IFACE}.ip=${EXT_IP}"
TAGS="${TAGS} -tag network.${EXT_IFACE}.netmask=${EXT_BCAST}"
TAGS="${TAGS} -tag network.${EXT_IFACE}.broadcast=${EXT_MASK}"
TAGS="${TAGS} -tag network.${EXT_IFACE}.mac=${EXT_MAC}"

echo "starting with "
echo "  INT_IFACE = ${INT_IFACE}"
echo "  INT_IFCFG = ${INT_IFCFG}"
echo "  INT_IP = ${INT_IP}"
echo "  INT_BCAST = ${INT_BCAST}"
echo "  INT_MASK = ${INT_MASK}"
echo "  INT_MAC = ${INT_MAC}"

/work/runtimes/serf agent -node dev-n1 ${TAGS}