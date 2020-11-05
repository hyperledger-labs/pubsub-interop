/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

// Using fabric-network version 1.4.8 to which is the latest supported by Caliper
const { Gateway, FileSystemWallet } = require('fabric-network');
const fs = require('fs');
const path = require('path');

async function main() {
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        let ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

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
        const blockchainContract = network.getContract('pubsub');

        // Submit the specified transaction to broker chaincode.
        // createTopic transaction - requires 5 args, ex: ('createTopic', 'BLOCKCHAIN0_0', 'FirstTopic', 'BLOCKCHAIN0', 'BLOCKCHAIN1', 'Initial message.')
        // publishToTopic transaction - requires 2 args , ex: ('publishToTopic', 'BLOCKCHAIN0_0', 'New message!')
        // subscribeToTopic transaction - requires 2 args, ex: ('subscribeToTopic', 'BLOCKCHAIN0_0', 'BLOCKCHAIN0')
        // unsubscribeFromTopic transaction - requires 2 args, ex: ('unsubscribeFromTopic', 'BLOCKCHAIN0_0', 'BLOCKCHAIN0')
        // unsubscribeFromAllTopics transaction - requires 1 args, ex: ('unsubscribeFromAllTopics', 'BLOCKCHAIN0')

        await brokerContract.submitTransaction('createTopic', 'BLOCKCHAIN0_0', 'FirstTopic', 'BLOCKCHAIN0', 'BLOCKCHAIN1', 'Initial message.');
        await brokerContract.submitTransaction('publishToTopic', 'BLOCKCHAIN0_0', 'New message!');
        await brokerContract.submitTransaction('subscribeToTopic', 'BLOCKCHAIN0_0', 'BLOCKCHAIN0');
        await brokerContract.submitTransaction('unsubscribeFromTopic', 'BLOCKCHAIN0_0', 'BLOCKCHAIN0');
        await brokerContract.submitTransaction('unsubscribeFromAllTopics', 'BLOCKCHAIN0');
        console.log('Transaction has been submitted');

        // Disconnect from the gateway.
        await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
    
}

main();
