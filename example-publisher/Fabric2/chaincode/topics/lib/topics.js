/*
The topics chaincode holds the information about the topics that this
publisher can publish to. This chaincode can be thought of as a connector
for interacting with the broker blockchain.
*/

'use strict';

const { Contract } = require('fabric-contract-api');

const axios = require('axios');

//The following information should be updated 
const brokerServer = "192.168.226.100"
const brokerPort = "8880"
const channelName = "mychannel"
const chaincodeName = "broker"
const brokerInvokePath = `/channels/${channelName}/chaincodes/${chaincodeName}`
const publisher_id = "BLOCKCHAIN3"

class Topics extends Contract {

    // Initialize the chaincode with an example topic.
    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        const topics = [
            {
                name: 'temp-topic',
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

    // Query the state of a topic.
    async queryTopic(ctx, topicNumber) {
        const topicAsBytes = await ctx.stub.getState(topicNumber); // get the topic from chaincode state
        if (!topicAsBytes || topicAsBytes.length === 0) {
            throw new Error(`${topicNumber} does not exist`);
        }
        console.log(topicAsBytes.toString());
        return topicAsBytes.toString();
    }

    // Create a new topic and put it in the ledger.
    async createTopic(ctx, topicNumber, name, message) {
        console.info('============= START : Create Topic ===========');

        const topic = {
            docType: 'topic',
            name,
            message,
        };

        await ctx.stub.putState(topicNumber, Buffer.from(JSON.stringify(topic)));

        const name_broker = publisher_id + '_' + topicNumber

        const updateUrl = `http://${brokerServer}:${brokerPort}${brokerInvokePath}`
        console.log(await createBrokerTopic(updateUrl, name_broker, name, message))
        console.info('============= END : Create Topic ===========');
    }

    // Query all the topics from the ledger. 
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

    // Publish to a topic by updating the ledger and notifying the broker.
    async publishToTopic(ctx, topicNumber, newMessage) {
        console.info('============= START : Publish to a Topic ===========');

        const topicAsBytes = await ctx.stub.getState(topicNumber); // get the topic from chaincode state
        if (!topicAsBytes || topicAsBytes.length === 0) {
            throw new Error(`${topicNumber} does not exist`);
        }
        const topic = JSON.parse(topicAsBytes.toString());
        topic.message = newMessage;

        await ctx.stub.putState(topicNumber, Buffer.from(JSON.stringify(topic)));
        
        const name_broker = publisher_id + '_' + topicNumber

        const updateUrl = `http://${brokerServer}:${brokerPort}${brokerInvokePath}`
        console.log(await updateTopic(updateUrl, name_broker, newMessage))
        
        console.info('============= END : Publish to a Topic ===========');
    }

}

// Invoke the broker's chaincode to update a topic.
const createTopic = async (url, topic_id, name, message) => {
    const publisher = publisher_id
    const subscribers = ''
    const headers = {
        "content-type": "application/json",
    }
    const data = {
        "fcn": "createTopic",
        "args":[topic_id, name, publisher, subscribers, message]
    }
    let response = await axios({
        method: 'post',
        url,
        headers,
        data,
      })
    return response.data
}

// Invoke the broker's chaincode to update a topic.
const updateBrokerTopic = async (url, topic_id, message) => {
    const headers = {
        "content-type": "application/json",
    }
    const data = {
        "fcn": "publishToTopic",
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


module.exports = Topics;
