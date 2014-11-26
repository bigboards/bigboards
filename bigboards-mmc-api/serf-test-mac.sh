#!/bin/bash

INT_IFACE="en0"
EXT_IFACE="en0"

INT_IFCFG="ifconfig $INT_IFACE"
INT_IP=$($INT_IFCFG | grep 'inet ' | awk '{ print $2}')
INT_BCAST=$($INT_IFCFG | grep 'inet ' | awk '{ print $6}')
INT_MASK=$($INT_IFCFG | grep 'inet ' | awk '{ print $4}')
INT_MAC=$($INT_IFCFG | grep 'ether ' |  awk '{ print $2}')
TAGS="${TAGS} -tag network.int.ip=${INT_IP}"
TAGS="${TAGS} -tag network.int.netmask=${INT_BCAST}"
TAGS="${TAGS} -tag network.int.broadcast=${INT_MASK}"
TAGS="${TAGS} -tag network.int.mac=${INT_MAC}"

EXT_IFCFG="ifconfig $EXT_IFACE"
EXT_IP=$($EXT_IFCFG | grep 'inet ' | awk '{ print $2}')
EXT_BCAST=$($EXT_IFCFG | grep 'inet ' | awk '{ print $6}')
EXT_MASK=$($EXT_IFCFG | grep 'inet ' | awk '{ print $4}')
EXT_MAC=$($EXT_IFCFG | grep 'ether ' |  awk '{ print $2}')
TAGS="${TAGS} -tag network.ext.ip=${EXT_IP}"
TAGS="${TAGS} -tag network.ext.netmask=${EXT_BCAST}"
TAGS="${TAGS} -tag network.ext.broadcast=${EXT_MASK}"
TAGS="${TAGS} -tag network.ext.mac=${EXT_MAC}"

serf agent ${TAGS}