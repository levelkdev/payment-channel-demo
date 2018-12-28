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
        uint256 withdrawn;
        bool closed;
        bool active;
        bool completed;
    }

    event LogDebug(uint256 refund);
    event LogRecoverySet(address recovery);
    event LogSubscriptionCancel(address subscriber);

    constructor(address payable recipient, uint256 amount) public {
      uint256 startgas = gasleft();
      //address payable sender = msg.sender; // this doesn't work
      address payable sender = 0xb2b0f76eCE233B8E4BB318E9d663BEAd67060cA8;

      // hub (part of demo7)
      allowed[address(0xb2b0f76eCE233B8E4BB318E9d663BEAd67060cA8)] = true;

      // part of demo6
      //recipient.transfer(amount);

      uint256 gasleft = gasleft();
      uint256 refund = (startgas.sub(gasleft)).mul(tx.gasprice);
      emit LogDebug(refund);
      sender.transfer(refund);
    }

    // set recovery address (part of demo7)
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
      //require(allowed[msg.sender] == true);

      Subscription memory sub = Subscription({
        subscriber: subscriber,
        max: 6 ether,
        limit: 1 ether,
        frequency: 1 minutes, // always in minutes
        withdrawn: 0,
        startDate: now,
        closeDate: 0,
        closed: false,
        active: true,
        completed: false
      });

      subscriptions[subscriber] = sub;
    }

    // allow subscriber to withdraw
    function withdraw(address payable subscriber) public {
      require(subscriptions[subscriber].completed == false);

      uint256 amount = withdrawalAmount(subscriber);
      require(address(this).balance >= amount);
      if (amount == 0 && subscriptions[subscriber].closed == true) {
        subscriptions[subscriber].completed = true;
      } else {
        subscriptions[subscriber].withdrawn = subscriptions[subscriber].withdrawn.add(amount);
        if (amount > 0) {
          subscriber.transfer(amount);
        }
      }
    }

    // calculate how much subscriber is allowed to withdraw
    function withdrawalAmount(address subscriber) public view returns(uint256) {
      uint256 endDate = now;
      if (subscriptions[subscriber].closeDate > 0) {
        endDate = subscriptions[subscriber].closeDate;
      }
      uint256 elapsedMinutes = (endDate - subscriptions[subscriber].startDate) / 60;
      uint256 amount = subscriptions[subscriber].limit;

      for (uint256 i = 0; i < elapsedMinutes; i++) {
        if (amount >= subscriptions[subscriber].max) {
          break;
        }

        amount = amount.add(subscriptions[subscriber].limit);
      }

      amount = amount.sub(subscriptions[subscriber].withdrawn);
      assert(amount >= 0);

      return amount;
    }

    // cancel subscriber subscription. subscriber is allowed to withdraw after it's closed
    function cancelSubscription(address subscriber) public {
      require(subscriptions[subscriber].closed == false);
      subscriptions[subscriber].closed = true;
      subscriptions[subscriber].active = false;
      subscriptions[subscriber].closeDate = now;

      uint256 amount = withdrawalAmount(subscriber);
      if (amount == 0) {
        subscriptions[subscriber].completed = true;
      }

      emit LogSubscriptionCancel(subscriber);
    }

    function subscriptionActive(address subscriber) public returns(bool) {
      return subscriptions[subscriber].active;
    }

    // whitelist accounts to access account funds
    function allow(address addr) public {
      require(allowed[msg.sender] == true);
      allowed[addr] = true;
    }

    // dewhitelist accounts to access account funds
    function unallow(address addr) public {
      require(allowed[msg.sender] == true);
      allowed[addr] = false;
    }

    function() payable external {}
}
