/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

// Using fabric-network version 1.4.8 to which is the latest supported by Caliper
const {FileSystemWallet, Gateway} = require('fabric-network');
const path = require('path');
const fs = require('fs');


async function main() {
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath)
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.exists('appUser');
        if (!identity) {
            console.log('An identity for the user "appUser" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const brokerContract = network.getContract('broker');
        const blockchainsContract = network.getContract('pubsub');

        // Evaluate the specified transaction from broker contract.
        // queryTopic transaction - requires 1 argument, ex: ('queryTopic', 'BLOCKCHAIN0_0')
        // queryAllTopics transaction - requires no arguments, ex: ('queryAllTopics')

        const brokerResult1 = await brokerContract.evaluateTransaction('queryTopic', 'BLOCKCHAIN0_0');
        const brokerResult2 = await brokerContract.evaluateTransaction('queryAllTopics');

        console.log(`Transaction has been evaluated, result is: ${brokerResult1.toString()}`);
        console.log(`Transaction has been evaluated, result is: ${brokerResult2.toString()}`);

        // Evaluate the specified transaction from pubsub contract.
        // queryBlockchain transaction - requires 1 argument, ex: ('queryBlockchain', 'BLOCKCHAIN0')
        // queryAllBlockchains transaction - requires no arguments, ex: ('queryAllBlockchains')
        const blockchainsResult1 = await blockchainsContract.evaluateTransaction('queryBlockchain', 'BLOCKCHAIN0');
        const blockchainsResult2 = await blockchainsContract.evaluateTransaction('queryAllBlockchains');
        console.log(`Transaction has been evaluated, result is: ${blockchainsResult1.toString()}`);
        console.log(`Transaction has been evaluated, result is: ${blockchainsResult2.toString()}`);

    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        process.exit(1);
    }
}

main();
