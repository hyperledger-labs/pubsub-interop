// Using fabric-network version 1.4.8 to which is the latest supported by Caliper
const {FileSystemWallet} = require('fabric-network');
const path = require('path');

async function main() {
    try{
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath)
        const identities = await wallet.list();

        console.log(identities)
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}

main();