/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

// const { Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const {FileSystemWallet, Gateway} = require('fabric-network');
const fs = require('fs');
const path = require('path');

async function main() {
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new CA client for interacting with the CA.
        const caURL = ccp.certificateAuthorities['ca.org1.example.com'].url;
        const ca = new FabricCAServices(caURL);

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        // const wallet = await Wallets.newFileSystemWallet(walletPath);
        const wallet = new FileSystemWallet(walletPath)
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        // const userIdentity = await wallet.get('appUser');
        const userIdentity = await wallet.exists('appUser');
        if (userIdentity) {
            console.log('An identity for the user "appUser" already exists in the wallet');
            return;
        }

        // Check to see if we've already enrolled the admin user.
        // const adminIdentity = await wallet.get('admin');
        const adminIdentity = await wallet.exists('admin');
        if (!adminIdentity) {
            console.log('An identity for the admin user "admin" does not exist in the wallet');
            console.log('Run the enrollAdmin.js application before retrying');
            return;
        }

        // build a user object for authenticating with the CA
        // const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
        // const adminUser = await provider.getUserContext(adminIdentity, 'admin');

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'admin' });
        // Get the CA client object from the gateway for interacting with the CA.
        const adminUser = gateway.getCurrentIdentity();

        // Register the user, enroll the user, and import the new identity into the wallet.
        const secret = await ca.register({
            affiliation: 'org1.department1',
            enrollmentID: 'appUser',
            role: 'client'
        }, adminUser);
        const enrollment = await ca.enroll({
            enrollmentID: 'appUser',
            enrollmentSecret: secret
        });
        // const x509Identity = {
        //     credentials: {
        //         certificate: enrollment.certificate,
        //         privateKey: enrollment.key.toBytes(),
        //     },
        //     mspId: 'Org1MSP',
        //     type: 'X.509',
        // };
        // await wallet.put('appUser', x509Identity);

        const x509Identity = {
            certificate: enrollment.certificate,
            privateKey: enrollment.key.toBytes(),
            mspId: 'Org1MSP',
            type: 'X.509',
        };
        await wallet.import('appUser', x509Identity);
        console.log('Successfully registered and enrolled admin user "appUser" and imported it into the wallet');

    } catch (error) {
        console.error(`Failed to register user "appUser": ${error}`);
        process.exit(1);
    }
}

main();
