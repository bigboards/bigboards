#!/bin/bash

# -- get the cluster name
read -r -p "What is the name of this cluster? " CLUSTER_NAME

# -- get the number of nodes
read -r -p "How many nodes are in this cluster? " NODE_COUNT
re='^[0-9]+$'
while ! [[ $NODE_COUNT =~ $re ]] ; do
   read -r -p "How many nodes are in this cluster? " NODE_COUNT
done

sudo apt-get install -y software-properties-common
sudo apt-add-repository -y ppa:ansible/ansible
sudo apt-get update
sudo apt-get install -y ansible

cat > /tmp/ansible_hosts << EOF
[local]
localhost   connection=local

[host:children]
host-coordinators
host-workers

[host-coordinators]
${CLUSTER_NAME}-n1   ansible_ssh_user=bb

[host-workers]
EOF

for i in $(seq 2 ${NODE_COUNT}); do
    echo "${CLUSTER_NAME}-n${i}     ansible_ssh_user=bb" >> /tmp/ansible_hosts
done

sudo mv /tmp/ansible_hosts /etc/ansible/hosts

exit $?
