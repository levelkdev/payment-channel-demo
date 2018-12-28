require('dotenv').config()
const Web3 = require('web3')

const { abi } = require('channel-contracts/build/contracts/Account.json')

const HDWalletProvider = require('truffle-hdwallet-provider')
const url = 'http://localhost:8545'
const mnemonic = process.env.MNEMONIC
const provider = new HDWalletProvider(
  mnemonic,
  url
)

const web3 = new Web3(provider)

async function setRecovery (contractAddress, recoveryAddress, signer) {
  const instance = new web3.eth.Contract(abi, contractAddress)
  const result = await instance.methods.setRecovery(recoveryAddress).send({
    from: signer
  })

  return result
}

async function removeRecovery (contractAddress, signer) {
  const instance = new web3.eth.Contract(abi, contractAddress)
  const result = await instance.methods.removeRecovery().send({
    from: signer,
  })

  return result
}

async function getOwner(contractAddress) {
  const instance = new web3.eth.Contract(abi, contractAddress)
  const owner = await instance.methods.owner().call()
  return owner
}

module.exports = {
	setRecovery,
	removeRecovery,
	getOwner
}
