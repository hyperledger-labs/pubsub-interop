# A Publish/Subscribe based Blockchain Interoperability Solution

In this project, the goal is to implement a messaging broker blockchain that can be used by other blockchains to interoperate. 

In the current implementation, a broker blockchain is implemented as a smart contract in Hyperledger Fabric V2.0. Also, two example subscribers and an example publisher network have been implemented for testing the broker. A Hyperledger Fabric V1.4 and a Hyperledger Besu network have been implemeneted as subscribers and a Hyperledger Fabric V2.0 has been implemented as a publisher. In other words, this platform enables interoperability through a broker for Hyperledger Fabric V2.0 and V1.4 as well as Hyperledger Besu. 

# Getting Started
To enable interoperability between two networks, you first need to run the broker blockchain. Then you can run the publisher and subscriber networks. 

## Broker network

The broker is a Hyperledger Fabric V2.o network. To run the broker blockchain test network, you first need to install the [Fabric Prerequisites](https://hyperledger-fabric.readthedocs.io/en/master/prereqs.html) as well as [the Fabric samples, binaries and Docker images](https://hyperledger-fabric.readthedocs.io/en/master/install.html).

The next step is to clone the current repository and go into the directory: 

``` bash
git clone https://github.com/hyperledger-labs/pubsub-interop
cd pubsub-interop/
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

## Subscriber Networks

Two example subscriber networks can be found under [example-subscriber](./example-subscriber). Details on how to run and implement each of these networks can be found in their documentations. The following are the steps that should be followed for each new subscriber blockchain. 

* Start and run the subscriber network and add the connector smart contract which is called "topics" to the network. 
* Register the newly created blockchain network in the broker. This can be done by invoking the "createBlockchain" function of the "pubsub" smart contract on the broker. 
* Subscribe to a topic by invoking the "subscribeToTopic" function of the "broker" smart contract on the broker.
* From this point forward, whenever a new message is published to the topic, this information is updated on the subscriber. 

## Publisher Networks

Currently, only Hyperledger Fabric is supported as a publisher in this platform. An example publisher networks can be found under [example-publisher](./example-publisher). Details on how to run and implement the network can be found in its documentations. The following are the steps that should be followed for each new publisher blockchain. 

* Start and run the publisher network and add the connector smart contract which is called "topics" to the network. 
* Register the newly created blockchain network in the broker. This can be done by invoking the "createBlockchain" function of the "pubsub" smart contract on the broker. 
* Create a new topic by invoking the "createTopic" function of the "broker" smart contract on the broker. 
* You can publish to the created topic at any time by invoking the "publishToTopic" function of the "broker" smart contract on the broker. 


