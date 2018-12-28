/* global artifacts */

const Factory = artifacts.require('./Factory.sol');
const Account = artifacts.require('./Account.sol');

module.exports = (deployer, network, accounts) => {
  deployer.then(async () => {
    await deployer.deploy(Factory)
    //await deployer.deploy(Account)
  })
}
