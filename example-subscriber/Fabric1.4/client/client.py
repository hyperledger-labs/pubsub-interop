import requests
import sys
import json
import urllib.parse

# Remeber to change hf_server back to the one above
# when sending a pull request to the public repo
server = "localhost"
port = "8880"

# Register and enroll new user in organization
def register_user(user_name, organization):
    url = "http://{}:{}/users".format(server, port)
    headers = {"content-type": "application/json"}
    data = {"username":user_name, "orgName": organization}
    print("Registering user")
    response = requests.post(url, headers=headers, json=data)
    print(json.loads(response.text))
    # print(json.loads(response.text)['success'] == True)
    return json.loads(response.text)['token']

# Create channel request
def create_channel(token, channel_name):
    url = "http://{}:{}/channels".format(server, port)
    auth = "Bearer " + token
    headers = {"authorization": auth, "content-type": "application/json"}
    data = {"channelName": channel_name,
            "channelConfigPath":"../artifacts/channel/{}.tx".format(channel_name)}
    print("Creating channel")
    response = requests.post(url, headers=headers, json=data)
    print(response.text)

# Join channel request
def join_channel(token, organization_lower, channel_name):
    url = "http://{}:{}/channels/{}/peers".format(server, port, channel_name)
    auth = "Bearer " + token
    headers = {"authorization": auth, "content-type": "application/json"}
    data = {"peers": ["peer0.{}.example.com".format(organization_lower),"peer1.{}.example.com".format(organization_lower)]}
    print("Joining channel")
    response = requests.post(url, headers=headers, json=data)
    print(response.text)

# Install chaincode
def install_chaincode(token, organization_lower ,chaincode_name, chaincode_path, chaincode_lang):
    url = "http://{}:{}/chaincodes".format(server, port)
    auth = "Bearer " + token
    headers = {"authorization": auth, "content-type": "application/json"}
    data = {"peers": ["peer0.{}.example.com".format(organization_lower),"peer1.{}.example.com".format(organization_lower)], 
            "chaincodeName": chaincode_name,
            "chaincodePath": chaincode_path,
            "chaincodeType": chaincode_lang,
            "chaincodeVersion":"v0"}
    print("Installing chaincode")
    response = requests.post(url, headers=headers, json=data)
    print(response.text)


# Instantiate chaincode
def instantiate_chaincode(token, organization_lower, channel_name, chaincode_name, chaincode_lang):
    url = "http://{}:{}/channels/{}/chaincodes".format(server, port, channel_name)
    auth = "Bearer " + token
    headers = {"authorization": auth, "content-type": "application/json"}
    data = {
            "chaincodeName": chaincode_name,
            "chaincodeType": chaincode_lang,
            "chaincodeVersion":"v0", 
            "args":["a","100","b","200"]
            }
    print("Instantiating chaincode")
    response = requests.post(url, headers=headers, json=data)
    print(response.text)

def get_installed_chaincodes(token, org):
    url = "http://{}:{}/chaincodes?peer=peer0.{}.example.com&type=installed".format(server, port, org)
    auth = "Bearer " + token
    headers = {"authorization": auth, "content-type": "application/json"}
    print("Getting installed chaincodes")
    response = requests.get(url, headers=headers)
    print(response.text)

def get_instantiated_chaincodes(token, org):
    url = "http://{}:{}/chaincodes?peer=peer0.{}.example.com&type=instantiated".format(server, port, org)
    auth = "Bearer " + token
    headers = {"authorization": auth, "content-type": "application/json"}
    print("Getting instantiated chaincodes")
    response = requests.get(url, headers=headers)
    print(response.text)

def query_topic(token, channel_name, chaincode_name, org, topic_name):
    query_set = str([topic_name]) 
    url = "http://{}:{}/channels/{}/chaincodes/{}?peer=peer0.{}.example.com&fcn=queryTopic&args={}".format(server, port,
         channel_name, chaincode_name, org, urllib.parse.quote(query_set))
    print(url)
    auth = "Bearer " + token
    headers = {"authorization": auth, "content-type": "application/json"}
    print("Querying topic")
    response = requests.get(url, headers=headers)
    print(response.text)

def invoke_new_topic(token, channel_name, chaincode_name, org, topic_id, name, message):
    url = "http://{}:{}/channels/{}/chaincodes/{}".format(server, port, channel_name, chaincode_name)
    auth = "Bearer " + token
    headers = {"authorization": auth, "content-type": "application/json"}
    data = {"peers": ["peer0.org1.example.com","peer0.org2.example.com"], 
        "fcn":"createTopic",
        "args":[topic_id, name, message]}
    print("Creating new topic")
    response = requests.post(url, headers=headers, json=data)
    print(response.text)

def invoke_update_topic(token, channel_name, chaincode_name, org, topic_id, message):
    url = "http://{}:{}/channels/{}/chaincodes/{}".format(server, port, channel_name, chaincode_name)
    auth = "Bearer " + token
    headers = {"authorization": auth, "content-type": "application/json"}
    data = {"peers": ["peer0.org1.example.com","peer0.org2.example.com"], 
        "fcn":"updateTopic",
        "args":[topic_id, message]}
    print("Updating topic")
    response = requests.post(url, headers=headers, json=data)
    print(response.text)

def initialize_network():
    topicsChaincode = 'topics'
    topicsPath = "./artifacts/src/topics"

    chaincodeLang = "node"
    user_list = ['sghaemi', 'admin', 'controller', 'provider_test', 'provider_test2', 'provider_test3']

    token1 = register_user('temp', 'Org1')
    token2 = register_user('temp', 'Org2')
    create_channel(token1, channelName)
    join_channel(token1, 'org1', channelName)
    join_channel(token2, 'org2', channelName)

    install_chaincode(token1, 'org1', topicsChaincode, topicsPath, chaincodeLang)
    install_chaincode(token2, 'org2', topicsChaincode, topicsPath, chaincodeLang)

    instantiate_chaincode(token1, 'org1', channelName, topicsChaincode, chaincodeLang)
    
    return token1, token2

if __name__ == "__main__":
    orgLower = org.lower()
    channelName = "mychannel"

    topicsChaincode = 'topics'
    topicsPath = "./artifacts/src/topics"

    chaincodeLang = "node"

    initialize_network()

    token = register_user(username, org)

    # query_topic(token, channelName, topicsChaincode, orgLower, "0")
    # invoke_update_topic(token, channelName, topicsChaincode, orgLower, "0", "I am testing!")
    # query_topic(token, channelName, topicsChaincode, orgLower, "0")
    # invoke_new_topic(token, channelName, topicsChaincode, orgLower, "1", "test", "I am testing!")
   