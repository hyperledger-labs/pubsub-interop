/*
The broker contract is responsible for storing information about topics.
Each topics has a publisher, a list of subscribers and a message. 
*/

'use strict';

const { Contract } = require('fabric-contract-api');

const axios = require('axios');

var Web3 = require('web3');
const fs = require('fs');
const PrivateKeyProvider = require("@truffle/hdwallet-provider");

class Broker extends Contract {

    // Initialize the chaincode with an example topic.
    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        const topics = [
            {
                name: 'temp-topic',
                publisher: 'Sara-pub',
                subscribers: ['BLOCKCHAIN0', 'BLOCKCHAIN1'],
                message: ''
            },
        ];

        for (let i = 0; i < topics.length; i++) {
            topics[i].docType = 'topic';
            await ctx.stub.putState('TOPIC' + i, Buffer.from(JSON.stringify(topics[i])));
            console.info('Added <--> ', topics[i]);
        }
        console.info('============= END : Initialize Ledger ===========');
    }

    // Query the state of a topic from the ledger.
    async queryTopic(ctx, topicNumber) {
        const topicAsBytes = await ctx.stub.getState(topicNumber); // get the topic from chaincode state
        if (!topicAsBytes || topicAsBytes.length === 0) {
            throw new Error(`${topicNumber} does not exist`);
        }
        console.log(topicAsBytes.toString());
        return topicAsBytes.toString();
    }

    // Create a new topic with the provided information and put it on the ledger.
    async createTopic(ctx, topicNumber, name, publisher, subscribers, message) {
        console.info('============= START : Create Topic ===========');
        const topic = {
            docType: 'topic',
            name,
            publisher,
            subscribers: [subscribers],
            message,
        };

        await ctx.stub.putState(topicNumber, Buffer.from(JSON.stringify(topic)));
        console.info('============= END : Create Topic ===========');
    }

    // Query all topics from the ledger.
    async queryAllTopics(ctx) {
        const startKey = '';
        const endKey = '';
        const allResults = [];
        for await (const {key, value} of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: key, Record: record });
        }
        console.info(allResults);
        return JSON.stringify(allResults);
    }

    // Subscribe to a topic. The new subscriber is added to the list of subscribers for the topic.
    async subscribeToTopic(ctx, topicNumber, newSubscriber) {
        console.info('============= START : Subscribe to a Topic ===========');

        const topicAsBytes = await ctx.stub.getState(topicNumber); // get the topic from chaincode state
        if (!topicAsBytes || topicAsBytes.length === 0) {
            throw new Error(`${topicNumber} does not exist`);
        }
        const topic = JSON.parse(topicAsBytes.toString());
        topic.subscribers.push(newSubscriber);

        await ctx.stub.putState(topicNumber, Buffer.from(JSON.stringify(topic)));
        console.info('============= END : Subscribe to a Topic ===========');
    }

    // Publish to a topic by updating the message and notifying all subscribers.
    async publishToTopic(ctx, topicNumber, newMessage) {
        console.info('============= START : Publish to a Topic ===========');

        const topicAsBytes = await ctx.stub.getState(topicNumber); // get the topic from chaincode state
        if (!topicAsBytes || topicAsBytes.length === 0) {
            throw new Error(`${topicNumber} does not exist`);
        }
        const topic = JSON.parse(topicAsBytes.toString());
        topic.message = newMessage;

        await ctx.stub.putState(topicNumber, Buffer.from(JSON.stringify(topic))); // update topic message on ledger
        
        
        for (let i = 0; i < topic.subscribers.length; i++) { // Send the updated message to all the subscribers 
            let subBCID = topic.subscribers[i]
            let arg = ["queryBlockchain", subBCID]

            console.log("Right before calling the blockchains chaincode")

            // Get the information for each subscriber from the blockchains chaincode.
            let response = await ctx.stub.invokeChaincode('blockchains', arg, "mychannel")
            let subBC = JSON.parse(response.payload.toString())

            if (subBC.type === 'Fabric'){
                const registerUrl = `http://${subBC.server}:${subBC.port}${subBC.registerUserPath}`
                const registerResp = await registerUser(registerUrl, subBC.user, subBC.org)
    
                const updateUrl = `http://${subBC.server}:${subBC.port}${subBC.invokePath}`
                console.log(await updateTopic(updateUrl, registerResp.token, topicNumber, newMessage)) // Invoke the subscriber's connector smart contract.
            } 
             else if (subBC.type === 'Besu') {
                updateBesuTopic('', '0', newMessage)
            }
           
        }
        
        console.info('============= END : Publish to a Topic ===========');
    }

}

// Register a user on the subscriber blockchain.
const registerUser = async (url, user_name, organization) => {
    const headers = {
        "content-type": "application/json",
    }
    const data = {
        "username": user_name, 
        "orgName": organization
    }
    let response = await axios({
        method: 'post',
        url,
        data, 
        headers,
      })
    return response.data
}

// Invoke the connector chaincode on the subscriber blockchain.
const updateTopic = async (url, token, topic_id, message) => {    
    const auth = "Bearer " + token
    const headers = {
        "authorization": auth, 
        "content-type": "application/json",
    }
    const data = {
        "peers": ["peer0.org1.example.com","peer0.org2.example.com"], 
        "fcn":"updateTopic",
        "args":[topic_id, message]
    }
    let response = await axios({
        method: 'post',
        url,
        headers,
        data,
      })
    return response.data
}

const updateBesuTopic = (url, id, message) => {
    // insert the private key of the account used in metamask eg: Account 1 (Miner Coinbase Account)
    const privateKey = "c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3";

    const web3Provider = new PrivateKeyProvider(privateKey, "http://162.246.156.104:8545")

    // web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
    var web3 = new Web3(web3Provider);


    // let AdoptionArtifact = JSON.parse(fs.readFileSync('./Topics.json'))
    // const abi = AdoptionArtifact['abi']
    // const address = AdoptionArtifact['networks']['2018']['address'] 
    const abi = [
        {
          "inputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "constructor"
        },
        {
          "constant": true,
          "inputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "name": "all_topics",
          "outputs": [
            {
              "internalType": "bool",
              "name": "exists",
              "type": "bool"
            },
            {
              "internalType": "string",
              "name": "name",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "message",
              "type": "string"
            }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        {
          "constant": false,
          "inputs": [
            {
              "internalType": "uint256",
              "name": "id",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "name",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "message",
              "type": "string"
            }
          ],
          "name": "newTopic",
          "outputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "constant": false,
          "inputs": [
            {
              "internalType": "uint256",
              "name": "id",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "message",
              "type": "string"
            }
          ],
          "name": "updateTopic",
          "outputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        }
      ]
    
    const address = "0x345cA3e014Aaf5dcA488057592ee47305D9B3e10"
    var MyContract = new web3.eth.Contract(abi, address)
    MyContract.setProvider(web3Provider)

    return new Promise((resolve, reject) => {
        web3.eth.getAccounts(async (error, accounts) => {
            if (error) {
                console.log("error");
            }

            var account = accounts[0];
            try{
                let results = await MyContract.methods.all_topics(id).call()
                if (results['2'] === message){
                    console.log("Already updated!")
                } else {
                    let result = await MyContract.methods.updateTopic(id, message).send({from: account})
                    if (result){
                        console.log("Topic updated successfully.")
                    }
                }
            } catch(e) {
                console.log("Caught an error!!", e)
            }  
            resolve()
        }) 
    })
}
module.exports = Broker;
