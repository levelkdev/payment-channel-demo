pragma solidity >0.4.99 <0.6.0;

import "./SafeMath.sol";

// POC contract

contract AccountInterface {
    function withdraw(address subscriber) public;
}

contract Spotethfy {
    using SafeMath for uint256;

    constructor() public {
      // TODO: pass in constructor
      address aliceContract = 0xEb69465A3cDc63FF0756185b779187B6db7674C8;

      AccountInterface(aliceContract).withdraw(address(this));

      // hub
      address payable recipient = 0xb2b0f76eCE233B8E4BB318E9d663BEAd67060cA8;
      //selfdestruct(recipient);
    }
}
