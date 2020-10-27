# Hyperledger Caliper Benchmarking

This folder contains the config files and infomation for running Caliper on the broker blockchain. To run Caliper the following steps should be taken. 

## Step 1: Installing Caliper

We use Caliper version 0.3.2 in this project. Make sure you are in the caliper-test folder and then run the following commands:

``` bash
npm install -g --only=prod @hyperledger/caliper-cli@0.3.2
caliper bind --caliper-bind-sut fabric:1.4.8 --caliper-bind-args=-g
```

## Step 2: Updating the network configuration file

The network configuration file can be found in the networks folder. The following objects in the config file need to updated based on your network:

* **wallet:** This object stores the path to your client's wallet. If you have followed the installation guide for the broker, you do not need to change this object. 

* **organizations:** In this object, you need to update the *path* for the *adminPrivateKey* and the *signedCert* properties. The name of the private key file changes every time a new network is run.

* **peers:** In this object, you need to update the *pem* under the *tlsCACerts* property for each peer. For peers in organization 1, this information can be found in test-network -> organizations -> peerOrganizations -> org1.example.com -> connection-org1.json. 

* **certificateAuthorities:** In this object, you need to update the *pem* under the *tlsCACerts* property for each certificate authority. For organization 1, this information can also be found in test-network -> organizations -> peerOrganizations -> org1.example.com -> connection-org1.json.

## Step 3: Running Caliper

You can use the following command to run Caliper.

``` bash 
caliper launch master --caliper-benchconfig benchmarks/myAssetBenchmark.yaml --caliper-networkconfig networks/network_config.json --caliper-workspace ./ --caliper-flow-only-test --caliper-fabric-gateway-usegateway --caliper-fabric-gateway-discovery
```

If you would like to automatically run Caliper with different configurations, you can modify and run the run-test.sh file.