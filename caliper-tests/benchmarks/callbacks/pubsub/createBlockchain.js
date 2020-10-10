'use strict';

module.exports.info  = 'Template callback';

const contractID = 'pubsub';
const version = '0.0.1';

let bc, ctx, clientArgs, clientIdx, number;

module.exports.init = async function(blockchain, context, args) {
    bc = blockchain;
    ctx = context;
    clientArgs = args;
    clientIdx = context.clientIdx.toString();
    console.log(clientIdx)
    number = 3;
};

module.exports.run = function() {
    const myArgs = {
        chaincodeFunction: 'createBlockchain',
        invokerIdentity: 'admin',
        chaincodeArguments: [`${number}`, 'test', 'Fabri', '1.1.1.1', '3000', '{}']
    };
    return bc.bcObj.invokeSmartContract(ctx, contractID, version, myArgs);
};

module.exports.end = async function() {
};