const CryptoZombies = artifacts.require("CryptoZombies");
const utils = require("./helpers/utils");
const time = require("@openzeppelin/test-helpers").time;
var expect = require('chai').expect;

const zombieNames = ["Zombie 1", "Zombie 2"];

async function print(str) {
    console.log(str);
}

contract("CryptoZombies", (accounts) => {
    let [alice, bob] = accounts;
    let cryptoZombiesInstance;

    beforeEach(async () => {
        cryptoZombiesInstance = await CryptoZombies.new();
    })

    afterEach(async () => {
        await cryptoZombiesInstance.kill();
    })

    it("should be able to create zombies", async () => {
        const result = await cryptoZombiesInstance.createRandomZombie(zombieNames[0], {from: alice});

        expect(result.receipt.status).to.equal(true);
        assert.equal(result.logs[0].args.name, zombieNames[0]);
    })
    it("should not allow two zombies", async () => {
        await cryptoZombiesInstance.createRandomZombie(zombieNames[0], {from: alice});
        await utils.shouldThrow(cryptoZombiesInstance.createRandomZombie(zombieNames[1], {from: alice}));
    })

    context("with the single-step transfer scenario", async () => {
        it("should transfer a zombie", async () => {
            const result = await cryptoZombiesInstance.createRandomZombie(zombieNames[0], {from: alice});
            const zombieId = result.logs[0].args.zombieId.toNumber();
            await cryptoZombiesInstance.transferFrom(alice, bob, zombieId, {from: alice});
            const newOwner = await cryptoZombiesInstance.ownerOf(zombieId);
            assert.equal(newOwner, bob);
        })
    })

    context("with the two-step transfer scenario", async () => {
        it("should approve and then transfer a zombie when the approved address calls transferFrom", async () => {
            const result = await cryptoZombiesInstance.createRandomZombie(zombieNames[0], {from: alice});
            const zombieId = result.logs[0].args.zombieId.toNumber();
            await cryptoZombiesInstance.approve(bob, zombieId, {from: alice});
            await cryptoZombiesInstance.transferFrom(alice, bob, zombieId, {from: bob});
            const newOwner = await cryptoZombiesInstance.ownerOf(zombieId);
            assert.equal(newOwner, bob);
        })
        it("should approve and then transfer a zombie when the owner calls transferFrom", async () => {
            const result = await cryptoZombiesInstance.createRandomZombie(zombieNames[0], {from: alice});
            const zombieId = result.logs[0].args.zombieId.toNumber();
            await cryptoZombiesInstance.approve(bob, zombieId, {from: alice});
            await cryptoZombiesInstance.transferFrom(alice, bob, zombieId, {from: alice});
            const newOwner = await cryptoZombiesInstance.ownerOf(zombieId);
            assert.equal(newOwner, bob);
        })
    })
    it("zombies should be able to attack another zombie", async () => {
        let result;
        result = await cryptoZombiesInstance.createRandomZombie(zombieNames[0], {from: alice});
        const firstZombieId = result.logs[0].args.zombieId.toNumber();
        result = await cryptoZombiesInstance.createRandomZombie(zombieNames[1], {from: bob});
        const secondZombieId = result.logs[0].args.zombieId.toNumber();
        await time.increase(time.duration.days(1));
        await cryptoZombiesInstance.attack(firstZombieId, secondZombieId, {from: alice});
        assert.equal(result.receipt.status, true);
    })

})