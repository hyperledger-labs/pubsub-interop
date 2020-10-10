'use strict';

module.exports.info  = 'Template callback';

const contractID = 'pubsub';
const version = '0.0.1';

let bc, ctx, clientArgs, clientIdx;

module.exports.init = async function(blockchain, context, args) {
    bc = blockchain;
    ctx = context;
    clientArgs = args;
    clientIdx = context.clientIdx.toString();
    console.log(clientIdx)
};

module.exports.run = function() {
    const myArgs = {
        chaincodeFunction: 'queryBlockchain',
        invokerIdentity: 'admin',
        chaincodeArguments: ['BLOCKCHAIN0']
    };
    return bc.bcObj.querySmartContract(ctx, contractID, version, myArgs);
};

module.exports.end = async function() {
};