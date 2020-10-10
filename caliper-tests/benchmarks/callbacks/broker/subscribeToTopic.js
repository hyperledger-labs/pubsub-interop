'use strict';

module.exports.info  = 'Template callback';

const contractID = 'broker';
const version = '0.0.1';

let bc, ctx, clientArgs, clientIdx, num;

module.exports.init = async function(blockchain, context, args) {
    bc = blockchain;
    ctx = context;
    clientArgs = args;
    clientIdx = context.clientIdx.toString();
    num = 0;
    console.log(clientIdx)
    // for (let i=0; i<clientArgs.assets; i++) {
    //     try {
    //         const assetID = `${clientIdx}_${i}`;
    //         console.log(`Client ${clientIdx}: Creating asset ${assetID}`);
    //         const myArgs = {
    //             chaincodeFunction: 'createTopic',
    //             invokerIdentity: 'admin',
    //             chaincodeArguments: [assetID,'blue','BLOCKCHAIN0','BLOCKCHAIN0','jim']
    //         };
    //         await bc.bcObj.invokeSmartContract(ctx, contractID, version, myArgs);
    //     } catch (error) {
    //         console.log(`Client ${clientIdx}: Smart Contract threw with error: ${error}` );
    //     }
    // }    
};

module.exports.run = function() {
    // const randomId = Math.floor(Math.random()*clientArgs.assets);
    const myArgs = {
        chaincodeFunction: 'subscribeToTopic',
        invokerIdentity: 'admin',
        chaincodeArguments: [`${clientIdx}_${num}`, `BLOCKCHAIN0`]
    };
    num += 1;
    if (num >= clientArgs.assets) num = 0;
    return bc.bcObj.invokeSmartContract(ctx, contractID, version, myArgs);
};

module.exports.end = async function() {
};