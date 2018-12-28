pragma solidity >0.4.99 <0.6.0;

import "./SafeMath.sol";

contract Account {
    using SafeMath for uint256;

    event LogDebug(uint256 refund);

    constructor(address payable recipient, uint256 amount) public {
      uint256 startgas = gasleft();
      // TODO: make it dynamic
      address payable recipient = 0xaC59D9C3f5d94bEcF12aFA90b8c1Dd3257039334;
      address payable sender = 0xb2b0f76eCE233B8E4BB318E9d663BEAd67060cA8;
      uint256 amount = 1 ether;

      recipient.transfer(amount);

      uint256 gasleft = gasleft();
      uint256 refund = (startgas.sub(gasleft)).mul(tx.gasprice);

      emit LogDebug(refund);

      sender.transfer(refund);
    }

    function() payable external {}
}
