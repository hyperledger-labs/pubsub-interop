"use strict"

var Web3 = require('web3');
const axios = require('axios');

const PrivateKeyProvider = require("@truffle/hdwallet-provider");

// insert the private key of the account used in metamask eg: Account 1 (Miner Coinbase Account)
const privateKey = "c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3";

const web3Provider = new PrivateKeyProvider(privateKey, "http://localhost:8545")

var web3 = new Web3(web3Provider);
const fs = require('fs');

let AdoptionArtifact = JSON.parse(fs.readFileSync('../pubsub-connector/build/contracts/Topics.json'))
const abi = AdoptionArtifact['abi']
const address = AdoptionArtifact['networks']['2018']['address']

var MyContract = new web3.eth.Contract(abi, address)
MyContract.setProvider(web3Provider)

const brokerServer = "192.168.226.100"
const brokerPort = "8880"
const brokerChannelName = "mychannel"
const brokerChaincodeName = "broker"
const brokerInvokePath = `/channels/${brokerChannelName}/chaincodes/${brokerChaincodeName}`
const blockchainID = 'BLOCKCHAIN1'

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

const getTopic = async (id) => {
    try{
        console.log(await MyContract.methods.all_topics(id).call())
    } catch(e){
        console.log(e)
    }
    return 0
}

const newTopic = (id, name, message) => {
    return new Promise((resolve, reject) => {
        web3.eth.getAccounts(async (error, accounts) => {
            if (error) {
                console.log("error");
            }
            var account = accounts[0];
            try{
                let results = await MyContract.methods.all_topics(id).call()
                if (results['0']){
                    console.log("Already exists!")
                } else {
                    let result = await MyContract.methods.newTopic(id, name, message).send({from: account})
                    if (result){
                        console.log("New topic successfully added. ")
                    }
                }
            } catch(e) {
                console.log("Caught an error!!", e)
            }  

            resolve()
        })
    })
}

const updateTopic = (id, message) => {
    return new Promise((resolve, reject) => {
        web3.eth.getAccounts(async (error, accounts) => {
            if (error) {
                console.log("error");
            }
            var account = accounts[0];
            try{
                let results = await MyContract.methods.all_topics(id).call()
                if (results['2'] === message){
                    console.log("Already updated!")
                } else {
                    let result = await MyContract.methods.updateTopic(id, message).send({from: account})
                    if (result){
                        console.log("Topic updated successfully.")
                    }
                }
            } catch(e) {
                console.log("Caught an error!!", e)
            }  
            resolve()
        }) 
    })
}

const main = async () => {
    await getTopic(0)
    console.log(await subscribeToTopic('BLOCKCHAIN3_3'))
    await newTopic(133, 'test', "This is the initial message!")
    await updateTopic(0, "This is the new meesage!")
    await getTopic(133)
}

main()

web3Provider.engine.stop();