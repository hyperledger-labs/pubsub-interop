const axios = require('axios');
// const qs = require('axios');

const server = "192.168.226.9"
const port = "8880"
const channelName = "mychannel"
const topicsChaincode = 'topics'
const chaincodeName = topicsChaincode
const topicsPath = "./artifacts/src/topics"
const org = 'org1'
const topic_name = 'TOPIC0'
const query_set = `%5B%27${topic_name}%27%5D` 

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

const main = async () => {
    const registerResp = await registerUser('pubsub', 'Org1')
    console.log(registerResp)
    console.log(await queryTopic(registerResp.token, 'org1', query_set))
    console.log(await updateTopic(registerResp.token, 'TOPIC0', 'new message!'))
}

main()