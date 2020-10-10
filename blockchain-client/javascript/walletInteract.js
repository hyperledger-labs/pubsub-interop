// const { Gateway, Wallets } = require('fabric-network');
const {FileSystemWallet} = require('fabric-network');
const path = require('path');

async function main() {
    // try{
    //     const walletPath = path.join(process.cwd(), 'wallet');
    //     // const wallet = await Wallets.newFileSystemWallet(walletPath);
    //     const wallet = new FileSystemWallet(walletPath)
    //     // await wallet.remove('admin.Org1');
    //     const identities = await wallet.list();

    //     console.log(identities)
    // } catch (error) {
    //     console.error(`Failed to submit transaction: ${error}`);
    //     process.exit(1);
    // }
    console.log('TOPIC100'.match(/\d+/)[0])
}

main();