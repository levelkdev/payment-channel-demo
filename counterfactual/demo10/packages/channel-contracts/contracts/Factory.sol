pragma solidity >0.4.99 <0.6.0;

contract Factory {
  event Deployed(address addr, uint256 salt);

  function deploy(bytes memory _code, uint256 _salt) public {
    address addr;
    assembly {
      addr := create2(0, add(_code, 0x20), mload(_code), _salt)
      if iszero(extcodesize(addr)) {revert(0, 0)}
    }

    emit Deployed(
      addr,
      _salt
    );
  }
}
