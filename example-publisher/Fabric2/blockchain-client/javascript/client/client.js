const axios = require('axios');


const server = "localhost"
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

const queryAllBroker = async (chaincodeName, fcn, query) => {

    let url = `http://${server}:${port}/channels/${channelName}/chaincodes/${chaincodeName}?` + 
              `fcn=${fcn}&args=${query}`
    const headers = {
        "content-type": "application/json",
    }
    let response = await axios({
        method: 'get',
        url,
        headers,
      })

    // let token = response.data.token
    return response.data
}

const invokeBroker = async (chaincodeName, fcn, topic_id, message) => {

    let url = `http://${server}:${port}/channels/${channelName}/chaincodes/${chaincodeName}`
    const headers = {
        "content-type": "application/json",
    }
    const data = {
        "fcn": fcn,
        "args":[topic_id, message]
    }
    let response = await axios({
        method: 'post',
        url,
        headers,
        data,
      })

    // let token = response.data.token
    return response.data
}

const main = async () => {
    // const registerResp = await registerUser('testUser', 'Org1')
    const resp = await queryAllBroker('broker', 'queryAllTopics', query_set)
    console.log(resp)
    const resp2 = await invokeBroker('broker', 'publishToTopic', 'TOPIC0', 'Invoking publish through broker Message!')
    console.log(resp2)
}

main()