pragma solidity >0.4.99 <0.6.0;

import "./SafeMath.sol";

// POC contract

contract Account {
    using SafeMath for uint256;

    address public recovery;
    mapping(address => bool) public allowed;
    mapping(address => Subscription) public subscriptions;

    struct Subscription {
        address subscriber;
        uint256 max;
        uint256 limit;
        uint256 frequency;
        uint256 startDate;
        uint256 closeDate;
        bool closed;
        bool active;
        bool completed;
    }

    event LogDebug(uint256 refund);
    event LogRecoverySet(address recovery);
    event LogSubscriptionCancel(address subscriber);

    constructor() public {
      uint256 startgas = gasleft();
      // TODO: pass in constructor
      address payable recipient = 0xaC59D9C3f5d94bEcF12aFA90b8c1Dd3257039334;
      //address payable sender = msg.sender; // this doesn't work
      address payable sender = 0xb2b0f76eCE233B8E4BB318E9d663BEAd67060cA8;

      // TODO: pass in constructor
      // hub
      allowed[address(0xb2b0f76eCE233B8E4BB318E9d663BEAd67060cA8)] = true;
      // alice
      allowed[address(0xc776E37126Bc5fa0e12e775416bB59E4884F8B2f)] = true;

      uint256 amount = 1 ether;

      recipient.transfer(amount);

      uint256 gasleft = gasleft();
      uint256 refund = (startgas.sub(gasleft)).mul(tx.gasprice);
      emit LogDebug(refund);
      sender.transfer(refund);
    }

    function setRecovery(address _recovery) public {
      require(allowed[msg.sender] == true);
      recovery = _recovery;
      emit LogRecoverySet(recovery);
    }

    function removeRecovery() public {
      uint256 startgas = gasleft();
      require(allowed[msg.sender] == true);
      recovery = address(0);

      // TODO: msg.sender
      address payable sender = 0xb2b0f76eCE233B8E4BB318E9d663BEAd67060cA8;
      uint256 gasleft = gasleft();
      uint256 refund = (startgas.sub(gasleft)).mul(tx.gasprice);
      sender.transfer(refund);
    }

    function subscribe(address subscriber) public {
      require(allowed[msg.sender] == true);

      Subscription memory sub = Subscription({
        subscriber: subscriber,
        max: 6 ether,
        limit: 1 ether,
        frequency: 1 minutes, // always in minutes
        startDate: now,
        closeDate: 0,
        closed: false,
        active: true,
        completed: false
      });

      subscriptions[subscriber] = sub;
    }

    // allow subscriber to withdraw after subscription is closed
    function withdraw(address payable subscriber) public {
      require(subscriptions[subscriber].closed == true);
      require(subscriptions[subscriber].completed == false);

      uint256 amount = withdrawalAmount(subscriber);
      require(address(this).balance >= amount);
      subscriptions[subscriber].completed = true;
      subscriber.transfer(amount);
    }

    // calculate how much subscriber is allowed to withdraw
    function withdrawalAmount(address subscriber) public returns(uint256) {
      uint256 elapsedMinutes = (subscriptions[subscriber].closeDate - subscriptions[subscriber].startDate) / 60;
      uint256 amount = 0;

      for (uint256 i = 0; i < elapsedMinutes; i++) {
        if (amount >= subscriptions[subscriber].max) {
          break;
        }

        amount = amount + subscriptions[subscriber].limit;
      }

      return amount;
    }

    // cancel subscriber subscription. subscriber is allowed to withdraw after it's closed
    function cancelSubscription(address subscriber) public {
      require(subscriptions[subscriber].closed == false);
      subscriptions[subscriber].closed = true;
      subscriptions[subscriber].active = false;
      subscriptions[subscriber].closeDate = now;

      emit LogSubscriptionCancel(subscriber);
    }

    function subscriptionActive(address subscriber) public returns(bool) {
      return subscriptions[subscriber].active;
    }

    function allow(address addr) public {
      require(allowed[msg.sender] == true);
      allowed[addr] = true;
    }

    function unallow(address addr) public {
      require(allowed[msg.sender] == true);
      allowed[addr] = false;
    }

    function() payable external {}
}
