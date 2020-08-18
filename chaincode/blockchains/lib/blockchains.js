/*
The blokchains contract stores the information about each publisher or subscriber 
and how we can connect to them.
*/

'use strict';

const { Contract } = require('fabric-contract-api');

class Blockchains extends Contract {

    // Initialize the blockchains chaincode with an example blockchain. 
    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        const channelName = 'mychannel';
        const topicsChaincode = 'topics';
        const blockchains = [
            {
                name: 'Sara-Subscriber',
                type: 'Fabric',
                server: '192.168.226.9',
                port: '8880',
                channelName,
                topicsChaincode,
                topicsPath: './artifacts/src/topics',
                registerUserPath: '/users',
                invokePath: `/channels/${channelName}/chaincodes/${topicsChaincode}`,
                updateTopicFunc: {
                    "peers": ["peer0.org1.example.com","peer0.org2.example.com"], 
                    "fcn":"updateTopic",
                    "args":["topic_id", "message"]
                },
                user: 'pubsub',
                org: 'Org1'

            },
            {
                name: 'Besu-Subscriber',
                type: 'Besu',
                server: '162.246.156.104',
                port: '8545',
                channelName,
                topicsChaincode,
                topicsPath: './artifacts/src/topics',
                registerUserPath: '/users',
                invokePath: `/channels/${channelName}/chaincodes/${topicsChaincode}`,
                updateTopicFunc: {
                    "peers": ["peer0.org1.example.com","peer0.org2.example.com"], 
                    "fcn":"updateTopic",
                    "args":["topic_id", "message"]
                },
                user: 'pubsub',
                org: 'Org1'
            }
        ];

        for (let i = 0; i < blockchains.length; i++) {
            blockchains[i].docType = 'blockchain';
            await ctx.stub.putState('BLOCKCHAIN' + i, Buffer.from(JSON.stringify(blockchains[i])));
            console.info('Added <--> ', blockchains[i]);
        }
        console.info('============= END : Initialize Ledger ===========');
    }

    // Query a blockchain by ID.
    async queryBlockchain(ctx, blockchainNumber) {
        console.info('============= START : Query Blockchain ===========');
        const blockchainAsBytes = await ctx.stub.getState(blockchainNumber); // get the blockchain from chaincode state
        if (!blockchainAsBytes || blockchainAsBytes.length === 0) {
            throw new Error(`${blockchainNumber} does not exist`);
        }
        console.log(blockchainAsBytes.toString());
        console.info('============= End : Query Blockchain ===========');
        return blockchainAsBytes.toString();
    }

    // Create a new blockchain entry and put it on the ledger.
    async createBlockchain(ctx, blockchainNumber, name, type, server, port, channelName, topicsChaincode, topicsPath, registerUserPath, 
        invokePath, updateTopicFunc, user, org) { 

        console.info('============= START : Create Blockchain ===========');

        const blockchain = {
            docType: 'blockchain',
            name,
            type,
            server,
            port,
            channelName,
            topicsChaincode,
            topicsPath,
            registerUserPath,
            invokePath,
            updateTopicFunc,
            user,
            org
        };

        await ctx.stub.putState(blockchainNumber, Buffer.from(JSON.stringify(blockchain)));
        console.info('============= END : Create Blockchain ===========');
    }

    // Query all the registered blockchains.
    async queryAllBlockchains(ctx) {
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


}

module.exports = Blockchains;
