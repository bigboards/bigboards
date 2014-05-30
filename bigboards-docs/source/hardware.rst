Hardware
#######################################################################################################################


A Node
=======================================================================================================================
A large part of BigBoards is centered around the Hex, an hexagon shaped cluster of 6 nodes. Each of these nodes have their own CPU, memory and storage in the form of a 2.5" harddrive.

+-----------+--------------------------------------+
| CPU       |  Cortex-A9 Quad core Freescale i.MX6 |
+-----------+--------------------------------------+
| Memory    |  2Gb DDR3                            |
+-----------+--------------------------------------+
| Network   |  Gigabit Ethernet                    |
+-----------+--------------------------------------+
| Storage   |  1Tb 7200RPM HDD + 16Gb MicroSD (OS) |
+-----------+--------------------------------------+

Network
=======================================================================================================================
There is a Gigabit Ethernet switch inside with a large enough back plane to support all six nodes sending data continuously.

One node has a wifi antenna, allowing WiFi connections to be made to the hex. It is important to note that the hex has to be configured to function as a client to an existing wireless network. It can (currently) not serve as an accesspoint for other devices to connect to.

Power
=======================================================================================================================
When you apply power to the hex you will do so by using an external AC to DC adapter. This adapter will transform the electricity from your wall outlet to 12VDC. Once fed into the hex it will be brought down to 5VDC to power the different nodes and harddisks. Depending on your model the internal switch will take 12VDC or 5VDC.

Due to the use of low energy consuming parts we are able to keep the power consumption as low as 48W during continuous high load. The Hex will idle around 28W.