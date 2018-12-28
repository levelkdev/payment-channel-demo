pragma solidity >0.4.99 <0.6.0;

import "./SafeMath.sol";

contract Account {
    using SafeMath for uint256;

    address public recovery;
    address public owner;

    event LogDebug(uint256 refund);
    event LogRecoverySet(address recovery);

    constructor() public {
      uint256 startgas = gasleft();
      // TODO: pass in constructor
      address payable recipient = 0xaC59D9C3f5d94bEcF12aFA90b8c1Dd3257039334;
      address payable sender = 0xb2b0f76eCE233B8E4BB318E9d663BEAd67060cA8;

      // TODO: pass in constructor
      // hub
      owner = address(0xb2b0f76eCE233B8E4BB318E9d663BEAd67060cA8);

      uint256 amount = 1 ether;

      recipient.transfer(amount);

      uint256 gasleft = gasleft();
      uint256 refund = (startgas.sub(gasleft)).mul(tx.gasprice);

      emit LogDebug(refund);

      sender.transfer(refund);
    }

    function setRecovery(address _recovery) public {
      require(msg.sender == owner);
      recovery = _recovery;
      emit LogRecoverySet(recovery);
    }

    function removeRecovery() public {
      uint256 startgas = gasleft();
      require(msg.sender == owner);
      recovery = address(0);

      address payable sender = 0xb2b0f76eCE233B8E4BB318E9d663BEAd67060cA8;
      uint256 gasleft = gasleft();
      uint256 refund = (startgas.sub(gasleft)).mul(tx.gasprice);
      sender.transfer(refund);
    }

    function() payable external {}
}
