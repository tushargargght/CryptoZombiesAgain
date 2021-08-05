pragma solidity ^0.5.4 <0.6.0;

import "./ZombieOwnership.sol";

contract CryptoZombies is ZombieOwnership {

    function kill() public onlyOwner {
        selfdestruct(address(uint160(owner())));
    }
}