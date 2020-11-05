# Hyperledger Fabric V2.0 example publisher

## Running the network

To run the broker blockchain test network, you need to have the [Fabric Prerequisites](https://hyperledger-fabric.readthedocs.io/en/master/prereqs.html) installed as well as [the Fabric samples, binaries and Docker images](https://hyperledger-fabric.readthedocs.io/en/master/install.html). Make sure the fabric binaries and configuration files are in the folder that holds the network files.

The next step is to clone the current repository and go into the directory: 

``` bash
git clone https://github.com/hyperledger-labs/pubsub-interop
cd pubsub-interop/example-publisher/Fabric2
```

Then you can start the test network by running the following command:

```bash
cd blockchain-client
sudo ./startFabric.sh javascript
```

Before using the network, you need to enroll an admin user and register a second user in the network. 

```bash
cd javascript
npm i 
node ./enrollAdmin.js
node ./registerUser.js
```

## Stopping the network

Use the following command to stop and delete the broker network.

```bash
sudo ./blockchain-client/networkDown.sh
```