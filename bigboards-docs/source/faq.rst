(Very) Frequently Asked Questions
#######################################################################################################################

.. topic:: There seems to be something wrong with the design of the hex. There is a big hole in the middle.

    Well, we actually did that on purpose. All though we are using low-power ARM based computing units which produce a significant less amount of heat then their intel based counterparts, there still is some heat we need to get rid of. The hole in the middle of the hex serves as a chimney, making use of natural air convection to evacuate hot air out of the hex from the top and sucking in cool air from the bottom. Pretty neat, right?

.. topic:: Why do you use ARM technology?

    By using ARM technology, we are able to keep the energy consumption as low as possible. Did you know the hex only consumes 48 Watts when under load?

.. topic:: There is only 2Gb of RAM on each node. Isn't that too low to work with bigdata technologies?

    Currently we are limited to 2Gbs of RAM because there aren't any boards around with more RAM. Even if there was, since 64bit ARM CPU's aren't around yet, you would be limited to less then 4Gb. Eventually we want to have as much memory as possible, but this is limited to what we can get from the market.
    That being said, close to all bigdata technologies can run on a hex. The only thing you need to keep in mind is the size of the dataset you are processing.

.. topic:: Doesn't ARM need specific packages?

    Indeed, packages built for ARM differ from the ones being build for x86. However, a lot of them are already available.