"use strict"

var Web3 = require('web3');

const PrivateKeyProvider = require("@truffle/hdwallet-provider");

// insert the private key of the account used in metamask eg: Account 1 (Miner Coinbase Account)
const privateKey = "c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3";

const web3Provider = new PrivateKeyProvider(privateKey, "http://162.246.156.104:8545")

var web3 = new Web3(web3Provider);
const fs = require('fs');

let AdoptionArtifact = JSON.parse(fs.readFileSync('../pubsub-connector/build/contracts/Topics.json'))
const abi = AdoptionArtifact['abi']
const address = AdoptionArtifact['networks']['2018']['address']

var MyContract = new web3.eth.Contract(abi, address)
MyContract.setProvider(web3Provider)

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
                let instance = await MyContract.deployed()
                let results = await MyContract.methods.all_topics(id).call()
                if (results['0']){
                    console.log("Already exists!")
                } else {
                    let result = await instance.newTopic(id, name, message, {from: account})
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
    // await newTopic(0, 'test', "This is the message!")
    // await updateTopic(0, "This is just a test!!")
    // await getTopic(0)
}

main()

web3Provider.engine.stop();