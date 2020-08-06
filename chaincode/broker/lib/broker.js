/*
The broker contract is responsible for storing information about topics.
Each topics has a publisher, a list of subscribers and a message. 
*/

'use strict';

const { Contract } = require('fabric-contract-api');

const axios = require('axios');

class Broker extends Contract {

    // Initialize the chaincode with an example topic.
    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        const topics = [
            {
                name: 'temp-topic',
                publisher: 'Sara-pub',
                subscribers: ['BLOCKCHAIN0'],
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

            const registerUrl = `http://${subBC.server}:${subBC.port}${subBC.registerUserPath}`
            const registerResp = await registerUser(registerUrl, subBC.user, subBC.org)

            const updateUrl = `http://${subBC.server}:${subBC.port}${subBC.invokePath}`
            console.log(await updateTopic(updateUrl, registerResp.token, topicNumber, newMessage)) // Invoke the subscriber's connector smart contract.
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


module.exports = Broker;
