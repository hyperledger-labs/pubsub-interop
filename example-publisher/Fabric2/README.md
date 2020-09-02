# Hyperledger Fabric V2.0 example publisher

## Running the network

To run the broker blockchain test network, you first need to install the [Fabric Prerequisites](https://hyperledger-fabric.readthedocs.io/en/master/prereqs.html) as well as [the Fabric samples, binaries and Docker images](https://hyperledger-fabric.readthedocs.io/en/master/install.html).

The next step is to clone the current repository and go into the directory: 

``` bash
git clone https://github.com/hyperledger-labs/pubsub-interop
cd pubsub-interop/example-publisher/Fabric2
```

Then you can start the test network by running the following command:

```bash
node ./blockchain-client/startFabric.sh javascript
```

Before using the network, you need to enroll an admin user and register a second user in the network. 

```bash
node ./blockchain-client/javascript/enrollAdmin.js
node ./blockchain-client/javascript/registerUser.js
```