/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

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
        // const wallet = await Wallets.newFileSystemWallet(walletPath);
        const wallet = new FileSystemWallet(walletPath)
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        // const identity = await wallet.get('appUser');
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

        // Submit the specified transaction.
        // createCar transaction - requires 5 argument, ex: ('createCar', 'CAR12', 'Honda', 'Accord', 'Black', 'Tom')
        // changeCarOwner transaction - requires 2 args , ex: ('changeCarOwner', 'CAR12', 'Dave')
        // await contract.submitTransaction('createTopic', 'TOPIC3', 'temp2', 'jo', 'jojo');
        // await contract.submitTransaction('publishToTopic', 'TOPIC0', 'Test Message!');
        await brokerContract.submitTransaction('publishToTopic', 'TOPIC0', 'Invoking publish through broker Message!1');
        // await brokerContract.submitTransaction('subscribeToTopic', 'TOPIC0', 'BLOCKCHAIN110');
        // await blockchainContract.submitTransaction('createBlockchain', 'BLOCKCHAIN1', 'Test', 'Test', 
        // 'Test', 'Test', 'Test', 'Test', 'Test' ,'Test', 'Test', 'Test', 'Test');
        console.log('Transaction has been submitted');

        // Disconnect from the gateway.
        await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
    
}

main();
