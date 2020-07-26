# A Publish/Subscribe based Blockchain Interoperability Solution

In this project, the goal is to implement a messaging broker blockchain that can be used by other blockchains to interoperate. 

In the current implementation, a broker blockchain is implemented as a smart contract in Hyperledger Fabric V2.0. Also, an example subscriber and an example publisher network have been implemented for testing the broker. 

# Getting Started
To run the broker blockchain test network, you first need to install the [Fabric Prerequisites](https://hyperledger-fabric.readthedocs.io/en/master/prereqs.html) as well as [the Fabric samples, binaries and Docker images](https://hyperledger-fabric.readthedocs.io/en/master/install.html).

The next step is to clone the current repository and go into the directory: 

``` bash
git clone https://github.com/ghaemisr/blockchain-pub-sub-interop
cd blockchain-pub-sub-interop/
```

Then you can start the test network by running the following command:

```bash
node ./utils/startFabric.sh javascript
```