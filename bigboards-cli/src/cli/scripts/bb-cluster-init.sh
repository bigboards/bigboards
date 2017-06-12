#!/bin/bash

# -- get the cluster name
read -r -p "What is the name of this cluster? " CLUSTER_NAME

# -- enter the ip address of the master node
read -r -p "Enter the internal ip addresses of the node participating as the cluster master: " MASTER_ADDRESS
re='^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$'
while ! [[ $MASTER_ADDRESS =~ $re ]] ; do
    echo "invalid input!"
    read -r -p "Enter the internal ip addresses of the node participating as the cluster master: " MASTER_ADDRESS
done

# -- list the ip addresses of the nodes participating in the cluster
read -r -p "Enter the internal ip addresses of the nodes participating in the cluster. Separate multiple entries with spaces: " NODE_ADDRESSES
re='^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}( (25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3})*$'
while ! [[ $NODE_ADDRESSES =~ $re ]] ; do
    echo "invalid input!"
    read -r -p "Enter the internal ip addresses of the nodes participating in the cluster. Separate multiple entries with spaces: " NODE_ADDRESSES
done

NODE_COUNT=$(wc -w <<< "$NODE_ADDRESSES")
echo "$NODE_COUNT worker node addresses entered."

# -- enter the netmask on which the nodes are communicating
read -r -p "Enter the cluster's netmask: " NETMASK
re='^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$'
while ! [[ $NETMASK =~ $re ]] ; do
    echo "invalid input!"
    read -r -p "Enter the cluster's netmask: " NETMASK
done

cat > /tmp/ansible_hosts << EOF
[all:vars]
bb_netmask: ${NETMASK}
bb_nic_int: eth0
bb_nic_ext: eth1
bb_dns: ${MASTER_ADDRESS}

[local]
localhost   connection=local

[host:children]
host-coordinators
host-workers

[host-coordinators]
${CLUSTER_NAME}-n1   ansible_ssh_user=bb   bb_node_sequence=1  bb_node_address=${MASTER_ADDRESS}

[host-workers]
EOF

SEQ=2
for i in $NODE_ADDRESSES; do
    echo "${CLUSTER_NAME}-n${SEQ}   ansible_ssh_user=bb     bb_node_sequence=${SEQ}  bb_node_address=$i" >> /tmp/ansible_hosts
    let SEQ=SEQ+1
done

sudo apt-get install -y software-properties-common
sudo apt-add-repository -y ppa:ansible/ansible
sudo apt-get update
sudo apt-get install -y ansible

#sudo mv /tmp/ansible_hosts /etc/ansible/hosts

# -- set variables depending on the architecture
#ARCHITECTURE=$(uname -m)
#INT_NIC="eth0"
#EXT_NIC="eth1"
#REF_NIC="eth0"

#HAS_BRIDGE=$([ $(ifconfig br1 2> /dev/null |wc -l) -gt 0 ] && echo 'yes' || echo 'no')
#if [ "$ARCHITECTURE" = "armv7l" && "$HAS_BRIDGE" = "yes" ]; then
#    REF_NIC="br0"
#fi

#IP_RANGE=$(echo `ifconfig $REF_NIC 2>/dev/null|awk '/inet addr:/ {print $2}'|sed 's/addr://'` | rev | cut -c 3- | rev)
#NETMASK=$(echo $(ifconfig $REF_NIC |grep Mask | tr -s ' ' | cut -d ':' -f4))

exit $?