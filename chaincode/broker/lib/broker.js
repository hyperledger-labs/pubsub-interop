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
            await ctx.stub.putState(`${i}`, Buffer.from(JSON.stringify(topics[i])));
            console.info('Added <--> ', topics[i]);
        }
        console.info('============= END : Initialize Ledger ===========');
    }

    // Query the state of a topic from the ledger.
    async queryTopic(ctx, topicNumber) {
        console.info('============= START : Initialize Query Topic ===========');
        const topicAsBytes = await ctx.stub.getState(topicNumber); // get the topic from chaincode state
        if (!topicAsBytes || topicAsBytes.length === 0) {
            throw new Error(`${topicNumber} does not exist`);
        }
        console.log(topicAsBytes.toString());
        console.info('============= END : Initialize Query Topic ===========');
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
        console.info('============= START : Initialize Query All Topics ===========');
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
        console.info('============= END : Initialize Query All Topics ===========');
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

            console.log("Right before calling the pubsub chaincode")
            console.log(topicNumber)

            // Get the information for each subscriber from the blockchains chaincode.
            let response = await ctx.stub.invokeChaincode('pubsub', arg, "mychannel")
            let subBC = JSON.parse(response.payload.toString())
            console.log(subBC)

            if (subBC.type === 'Fabric'){
                const registerUrl = `http://${subBC.server}:${subBC.port}${subBC.info.registerUserPath}`
                console.log(registerUrl)
                const registerResp = await registerUser(registerUrl, subBC.info.user, subBC.info.org)
                console.log(registerResp)
                const updateUrl = `http://${subBC.server}:${subBC.port}${subBC.info.invokePath}`
                console.log(updateUrl)
                console.log(await updateTopic(updateUrl, registerResp.token, subBC.info.peers,  subBC.info.fcn, topicNumber, newMessage)) // Invoke the subscriber's connector smart contract.
            } 
             else if (subBC.type === 'Besu') {
                let code = ''
                let hasUnderScore = topicNumber.match(/(\d+)_(\d+)/)
                if (!hasUnderScore) code = topicNumber.match(/\d+/)[0]
                else code = hasUnderScore[1] + '_'.charCodeAt(0) + hasUnderScore[2]
                const url = `http://${subBC.server}:${subBC.port}`
                updateBesuTopic(url, subBC.info.privateKey, subBC.info.address, subBC.info.abi, code, newMessage)
            }
        }
        
        console.info('============= END : Publish to a Topic ===========');
    }

}

// Register a user on the subscriber blockchain.
const registerUser = async (url, user_name, organization) => {
    console.info('============= START : Register User in Fabric Network ===========');
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
    console.info('============= END : Register User in Fabric Network ===========');
    return response.data
}

// Invoke the connector chaincode on the subscriber blockchain.
const updateTopic = async (url, token, peers, fcn, topic_id, message) => { 
    console.info('============= START : Update Topic in Remote Fabric Network ===========');   
    const auth = "Bearer " + token
    const headers = {
        "authorization": auth, 
        "content-type": "application/json",
    }
    const data = {
        "peers": peers,
        "fcn": fcn,
        "args":[topic_id, message]
    }
    let response = await axios({
        method: 'post',
        url,
        headers,
        data,
      })
    console.info('============= END : Update Topic in Remote Fabric Network ===========');   
    return response.data
}

const updateBesuTopic = (url, privateKey, address, abi, id, message) => {
    console.info('============= START : Update Topic in Remote Besu Network ===========');
    const web3Provider = new PrivateKeyProvider(privateKey, url)

    var web3 = new Web3(web3Provider);

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
            console.info('============= END : Update Topic in Remote Besu Network ===========');  
            resolve()
        }) 
    })
    
}
module.exports = Broker;
