pragma solidity ^0.5.0;

contract Topics{

    struct Topic {
    bool exists;
    string name; 
    string message;  
    }

    mapping(uint => Topic) public all_topics;

    constructor() public{
        newTopic(0, 'TempTopic', 'This is the message');
    }

    function newTopic(uint id, string memory name, string memory message) public{
        if(!all_topics[id].exists){
            all_topics[id] = Topic({
                exists: true,
                name: name, 
                message: message
            });
        }
    }

    function updateTopic(uint id, string memory message) public{
        if(all_topics[id].exists){
            all_topics[id].message = message;
        }
    }
}