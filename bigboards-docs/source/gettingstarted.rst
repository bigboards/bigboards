Getting started
###############

Wiring it
=========
Since the hex is an electronical device, it benefits of having power. This means you will have to make a connection from your hex to your wall outlet. An external power supply is provided to make this connection.

1. Plug the round power plug into the hex
   You can find the power jack next to the wireless antenna at the bottom of the device

2. Plug the power supply into a wall outlet

Once a connection has been made, the LED's at the bottom of the hex will light up.

Making a wired network connection
=================================
The hex contains a switch which you can use at any time to hook your laptop to the device. There is no DHCP server running so you will have to configure an ip address yourself.

1. Adept your network configuration to: ::
	ip address: 172.20.40.14
	netmask: 255.255.255.240

2. Connect to the management console at http://172.20.40.1/

Connecting to your wireless network
===================================
A hex is equiped with a wireless connection on the master node. This means it can make a connection to a wireless accesspoint or router. Depending on your level of security you will have to modify different settings.

We are working on making this configurable through the web interface, but currently this has to be configured through editing the configuration files on the master node.

1. Connect to the master node using your favorite SSH client:::
	local #> ssh bb@172.20.40.1
	password: <Swh^bdl>

2. Open an editor to modify the network configuration files.::
	bb1 #> nano /etc/network/interfaces

3. Make modifications to the network configuration
   
