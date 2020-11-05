/*
The blokchains contract stores the information about each publisher or subscriber 
and how we can connect to them.
*/

'use strict';

const { Contract } = require('fabric-contract-api');

class Pubsub extends Contract {

    // Initialize the blockchains chaincode with an example blockchain. 
    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        const channelName = 'mychannel';
        const topicsChaincode = 'topics';
        const blockchains = [
            {
                name: 'Sara-Subscriber',
                type: 'Fabric',
                server: '192.168.226.108',
                port: '8880',
                info: {
                    channelName,
                    topicsChaincode,
                    topicsPath: './artifacts/src/topics',
                    registerUserPath: '/users',
                    invokePath: `/channels/${channelName}/chaincodes/${topicsChaincode}`,
                    peers: ["peer0.org1.example.com","peer0.org2.example.com"], 
                    fcn : 'updateTopic',
                    user: 'pubsub',
                    org: 'Org1'
                }
            },
            {
                name: 'Besu-Subscriber',
                type: 'Besu',
                server: '192.168.226.119',
                port: '8545',
                info: {
                    privateKey: "c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3",
                    address: "0x345cA3e014Aaf5dcA488057592ee47305D9B3e10",
                    abi: [
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
                      ],

                }
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
     async createBlockchain(ctx, blockchainNumber, name, type, server, port, info) { 

        console.info('============= START : Create Blockchain ===========');

        const blockchain = {
            docType: 'blockchain',
            name,
            type,
            server,
            port,
            info
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

module.exports = Pubsub;
