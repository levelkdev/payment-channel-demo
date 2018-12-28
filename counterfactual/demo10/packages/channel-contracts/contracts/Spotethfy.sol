pragma solidity >0.4.99 <0.6.0;

import "./SafeMath.sol";

// POC contract

contract AccountInterface {
    function withdraw(address subscriber) public;
    function cancelSubscription(address subscriber) public;
}

contract Spotethfy {
    using SafeMath for uint256;

    address payable public aliceContract;

    constructor(address payable _aliceContract) public payable {
      aliceContract = _aliceContract;
      AccountInterface(aliceContract).withdraw(address(this));
    }

    function close() public payable {
      AccountInterface(aliceContract).cancelSubscription(address(this));
      AccountInterface(aliceContract).withdraw(address(this));

      // (hub addr for testing)
      address payable recipient = 0xb2b0f76eCE233B8E4BB318E9d663BEAd67060cA8;
      selfdestruct(recipient);
    }

    function() external payable {}
}
