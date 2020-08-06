pragma solidity ^0.5.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Topics.sol";

contract TestAdoption {
  // The address of the adoption contract to be tested
  Topics topics = Topics(DeployedAddresses.Topics())

}
