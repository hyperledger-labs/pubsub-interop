# A Publish/Subscribe based Blockchain Interoperability Solution

[Paper available here](https://arxiv.org/abs/2101.12331)

In this project, the goal is to implement a messaging broker blockchain that can be used by other blockchains to interoperate. 

In the current implementation, a broker blockchain is implemented as a smart contract in Hyperledger Fabric V2.0. Also, two example subscribers and an example publisher network have been implemented for testing the broker. A Hyperledger Fabric V1.4 and a Hyperledger Besu network have been implemeneted as subscribers and a Hyperledger Fabric V2.0 has been implemented as a publisher. In other words, this platform enables interoperability through a broker for Hyperledger Fabric V2.0 and V1.4 as well as Hyperledger Besu. 

# Getting Started
To enable interoperability between two networks, you first need to run the broker blockchain. Then you can run the publisher and subscriber networks. 

## Broker network

The broker is a Hyperledger Fabric V2.0 network. To run the broker blockchain test network, you first need to install the [Fabric Prerequisites](https://hyperledger-fabric.readthedocs.io/en/release-2.2/prereqs.html) as well as Node.js v8.13.0 or higher.

The next step is to clone the current repository and go into the directory: 

``` bash
git clone https://github.com/hyperledger-labs/pubsub-interop
cd pubsub-interop
```

The next step is to install [the Fabric binaries and Docker images](https://hyperledger-fabric.readthedocs.io/en/release-2.2/install.html). You can do so by running the following command:

```bash
curl -sSL https://bit.ly/2ysbOFE | bash -s -- -s
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
node enrollAdmin.js
node registerUser.js
```
Use the following command to stop and delete the broker network.

```bash
sudo ./networkDown.sh
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


