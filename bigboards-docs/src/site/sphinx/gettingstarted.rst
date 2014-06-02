Getting started
###############

Power
=======================================================================================================================
Since the hex is an electronical device, it benefits from having power. This means you will have to make a connection from your hex to your wall outlet. An external power supply is provided to make this connection.

#. Plug the round power plug into the hex. You can find the power jack next to the wireless antenna at the bottom of the device

#. Plug the power supply into a wall outlet

Once a connection has been made, the LED's at the bottom of the hex will light up.

Network
=======================================================================================================================

Making a wired network connection
-----------------------------------------------------------------------------------------------------------------------
The hex contains a switch which you can use at any time to hook your laptop to the device. There is no DHCP server running so you will have to configure an ip address yourself.

#. Connect your hex directly to the internal switch of the hex. Plug a regular Cat5 ethernet cable into one of the two free ports at the bottom of the hex. Plug the other end of the ehternet cable into your laptop or desktop.

#. On your laptop or desktop, change the network configuration to use a static ip address. You will need the following parameters to do this: ::

	ip address: 172.20.40.14
	netmask: 255.255.255.240

#. Connect to the management console at http://172.20.40.1/

Connecting to your wireless network
-----------------------------------------------------------------------------------------------------------------------
A hex is equiped with a wireless connection on the master node. This means it can make a connection to a wireless accesspoint or router. Depending on your level of security you will have to modify different settings.

We are working on making this configurable through the web interface, but currently this has to be configured through editing the configuration files on the master node.

#. Connect your hex to your wired network. You can look at the previous section on how to that.

#. Connect to the master node using your favorite SSH client: ::

	local #> ssh bb@172.20.40.1
	password: <Swh^bdl>

#. Open an editor to modify the network configuration files: ::

	bb1 #> nano /etc/network/interfaces

#. Make modifications to the network configuration: ::

    auto wlan0
    iface wlan0 inet dhcp
        wireless-essid <your-ssid>

#. You can use the iwconfig and ifconfig commands to check if your hex is connected to your wireless network. For example, you should be able to see something like the following when running the iwconfig command: ::

    ⬢ dexter bb@bb1 ~$ iwconfig wlan0
    wlan0     IEEE 802.11abg  ESSID:"<Your SSID>"
              Mode:Managed  Frequency:2.462 GHz  Access Point: XX:XX:XX:XX:XX:XX
              Bit Rate=65 Mb/s   Tx-Power=1496 dBm
              Retry  long limit:7   RTS thr:off   Fragment thr:off
              Power Management:on
              Link Quality=59/70  Signal level=-51 dBm
              Rx invalid nwid:0  Rx invalid crypt:0  Rx invalid frag:0
              Tx excessive retries:0  Invalid misc:0   Missed beacon:0

#. Running ifconfig will tell you the exact ip address your hex received ::

    ⬢ dexter bb@bb1 ~$ ifconfig wlan0
    wlan0     Link encap:Ethernet  HWaddr XX:XX:XX:XX:XX:XX
              inet addr:192.168.2.101  Bcast:192.168.2.255  Mask:255.255.255.0
              UP BROADCAST RUNNING MULTICAST  MTU:1500  Metric:1
              RX packets:561292 errors:0 dropped:2 overruns:0 frame:0
              TX packets:328255 errors:0 dropped:0 overruns:0 carrier:0
              collisions:0 txqueuelen:1000
              RX bytes:601276696 (601.2 MB)  TX bytes:94125372 (94.1 MB)

Use Your hex
=======================================================================================================================
If you point your web browser to http://<ip address>/, you will be presented with a web based management console. From here you can monitor the resource usage of your hex, as well as performing management operations like updating or installing tints.