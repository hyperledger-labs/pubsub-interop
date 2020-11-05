const axios = require('axios');
// const qs = require('axios');

const server = "192.168.226.108"
const port = "8880"
const channelName = "mychannel"
const topicsChaincode = 'topics'
const chaincodeName = topicsChaincode
const topicsPath = "./artifacts/src/topics"
const org = 'org1'
const topic_name = 'BLOCKCHAIN3_3'
const query_set = `%5B%27${topic_name}%27%5D` 

const brokerServer = "192.168.226.100"
const brokerPort = "8880"
const brokerChannelName = "mychannel"
const brokerChaincodeName = "broker"
const brokerInvokePath = `/channels/${brokerChannelName}/chaincodes/${brokerChaincodeName}`
const blockchainID = 'BLOCKCHAIN0'

// Invoke the broker's chaincode to subscribe to a topic.
const subscribeToTopic = async (topic_id) => {
    const url = `http://${brokerServer}:${brokerPort}${brokerInvokePath}`
    const headers = {
        "content-type": "application/json",
    }
    const data = {
        "fcn": "subscribeToTopic",
        "args":[topic_id, blockchainID]
    }
    let response = await axios({
        method: 'post',
        url,
        headers,
        data,
      })
    return response.data
}

const registerUser = async (user_name, organization) => {
    let url = `http://${server}:${port}/users`
    const headers = {
        "content-type": "application/json",
    }
    const data = {
        "username": user_name, 
        "orgName": organization
    }
    let response = await axios({
        method: 'post',
        url,
        data, 
        headers,
      })
    // let token = response.data.token
    return response.data
}

const queryTopic = async (token, organization, query) => {
    const auth = "Bearer " + token
    let url = `http://${server}:${port}/channels/${channelName}/chaincodes/${chaincodeName}?` + 
              `peer=peer0.${organization}.example.com&fcn=queryTopic&args=${query}`
    const headers = {
        "authorization": auth, 
        "content-type": "application/json",
    }
    let response = await axios({
        method: 'get',
        url,
        headers,
      })
    return response.data
}

const updateTopic = async (token, topic_id, message) => {
    const auth = "Bearer " + token
    let url = `http://${server}:${port}/channels/${channelName}/chaincodes/${chaincodeName}`
    const headers = {
        "authorization": auth, 
        "content-type": "application/json",
    }
    const data = {
        "peers": ["peer0.org1.example.com","peer0.org2.example.com"], 
        "fcn":"updateTopic",
        "args":[topic_id, message]
    }
    let response = await axios({
        method: 'post',
        url,
        headers,
        data,
      })
    return response.data
}

const createTopic = async (token, topic_id, message) => {
    const auth = "Bearer " + token
    let url = `http://${server}:${port}/channels/${channelName}/chaincodes/${chaincodeName}`
    const headers = {
        "authorization": auth, 
        "content-type": "application/json",
    }
    const data = {
        "peers": ["peer0.org1.example.com","peer0.org2.example.com"], 
        "fcn":"createTopic",
        "args":[topic_id, message]
    }
    let response = await axios({
        method: 'post',
        url,
        headers,
        data,
      })
    return response.data
}

const main = async () => {
    const registerResp = await registerUser('pubsub', 'Org1')
    console.log(registerResp)
    console.log(await createTopic(registerResp.token, 'BLOCKCHAIN3_3', 'test message'))
    console.log(await queryTopic(registerResp.token, 'org1', query_set))
    console.log(await subscribeToTopic('BLOCKCHAIN3_3'))
    console.log(await updateTopic(registerResp.token, 'TOPIC0', 'new message!'))
    

}

main()