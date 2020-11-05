/*
The topics chaincode holds the information about the topics that this
subscriber has subscribed to. This chaincode can be thought of as a connector
for interacting with the broker blockchain.
*/
const shim = require('fabric-shim');

var Chaincode = class {
    
    // Initialize the chaincode with an example topic.
    async Init(stub) {
        console.info('============= START : Initialize Ledger ===========');
        const topics = [
            {
                name: "temp-topics1", 
                message: ""
            },
        ];

        for (let i = 0; i < topics.length; i++) {
            topics[i].docType = 'topic';
            try {
                await stub.putState(`${i}`, Buffer.from(JSON.stringify(topics[i])));
            } catch (err) {
                return shim.error(err);
            }
            console.info('Added <--> ', topics[i]);
        }
        console.info('============= END : Initialize Ledger ===========');
        return shim.success();
    }

    // Query the state of a topic.
    async queryTopic(stub, args) {
        if (args.length != 1) {
            throw new Error('Incorrect number of arguments. Expecting number of the topic to query')
        }
        let jsonResp = {};
        let topicNumber = args[0];
        const topicAsBytes = await stub.getState(topicNumber); // get the topic from chaincode state
        if (!topicAsBytes || topicAsBytes.length === 0) {
            throw new Error(`${topicNumber} does not exist`);
        }
        jsonResp.name = topicNumber;
        jsonResp.amount = topicAsBytes.toString();
        console.info('Query Response:');
        console.info(jsonResp);
        console.info(topicAsBytes.toString())
        console.log(topicAsBytes.toString());
        return topicAsBytes;
    }

    // Create a new topic and put it in the ledger.
    async createTopic(stub, args) {
        console.info('============= START : Create topic ===========');
        
        let topicID = args[0];
        let topicAsBytes = await stub.getState(topicID);
        if (topicAsBytes && topicAsBytes.length != 0) {
            throw new Error(`Topic ${topicID} already exists`);
        }

        let name = args[1];
        let message = args[2];
        const topic = {
            docType: 'topic',
            name, 
            message,
        };

        await stub.putState(topicID, Buffer.from(JSON.stringify(topic)));
        console.info('============= END : Create topic ===========');
    }

    // Update a topic's message on the ledger.
    async updateTopic(stub, args) {
      console.info('============= START : Update topic ===========');

      let topicKey = args[0];
      let topicAsBytes = await stub.getState(topicKey);
      if (!topicAsBytes || topicAsBytes.length === 0) {
          throw new Error(`${topicKey} does not exists`);
      }
      let topicVal = JSON.parse(topicAsBytes.toString());
      let newMessage = args[1];
      if (topicVal['message'] === newMessage){
        console.info("Topic is already up to date.");
        return Buffer.from("Topic is already up to date.", 'utf8')
      } else {
        topicVal['message'] = newMessage;
        await stub.putState(topicKey, Buffer.from(JSON.stringify(topicVal)));
      }
      console.info('============= END : Update topic ===========');
  }

    // Invoke one of the implemented methods.
    async Invoke(stub) {
        let ret = stub.getFunctionAndParameters();
        console.info(ret);

        let method = this[ret.fcn];
        if (!method) {
            console.error('no method of name:' + ret.fcn + ' found');
            return shim.error('no method of name:' + ret.fcn + ' found');
        }

        console.info('\nCalling method : ' + ret.fcn);
        try {
            let payload = await method(stub, ret.params);
            return shim.success(payload);
        } catch (err) {
            console.log(err);
            return shim.error(err);
        }
    }
    
};

shim.start(new Chaincode());
