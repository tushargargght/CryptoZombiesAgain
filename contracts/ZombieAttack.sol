pragma solidity ^0.5.4 <0.6.0;

import "./ZombieHelper.sol";

contract ZombieAttack is ZombieHelper {

    uint randNonce = 0;
    uint attackVictoryProbability = 70;

    function randMod(uint _modulus) internal returns (uint) {
        randNonce = randNonce.add(1);
        return uint(keccak256(abi.encodePacked(now, msg.sender, randNonce))) % _modulus;
    }

    function attack(uint _zombieId, uint _targetId) external onlyZombieOwner(_zombieId) {
        Zombie storage myZombie = zombies[_zombieId];
        Zombie storage targetZombie = zombies[_targetId];

        uint rand = randMod(100);

        if (rand <= attackVictoryProbability) {
            myZombie.winCount = myZombie.winCount.add(1);
            myZombie.level = myZombie.level.add(1);
            targetZombie.lossCount = targetZombie.lossCount.add(1);
            feedAndMultiply(_zombieId, targetZombie.dna, SPECIES_ZOMBIE);
        } else {
            myZombie.lossCount = myZombie.lossCount.add(1);
            targetZombie.winCount = targetZombie.winCount.add(1);
            _triggerCooldown(myZombie);
        }
    }
}