require('dotenv').config()
const Web3 = require('web3')
const assert = require('assert')
const fs = require('fs')
const path = require('path')

const {
  buildCreate2Address,
  numberToUint256,
  encodeParam
} = require('./helpers')

const { abi, networks } = require('channel-contracts/build/contracts/Factory.json')
const Account = require('channel-contracts/build/contracts/Account.json')
const { bytecode } = Account
const { address } = networks[Object.keys(networks)[0]]

// const provider = new Web3.providers.HttpProvider('http://localhost:8545')

const HDWalletProvider = require('truffle-hdwallet-provider')

const url = 'http://localhost:8545'
const mnemonic = process.env.MNEMONIC
const provider = new HDWalletProvider(
  mnemonic,
  url
)

const web3 = new Web3(provider)

async function deployContract (salt, recipient, amount) {
  const factory = new web3.eth.Contract(abi, address)
  const account = '0xb2b0f76ece233b8e4bb318e9d663bead67060ca8'
  const nonce = await web3.eth.getTransactionCount(account)
  const bcode = `${bytecode}${encodeParam('address', recipient).slice(2)}${encodeParam('uint256', amount).slice(2)}`
  const result = await factory.methods.deploy(bcode, salt).send({
    from: account,
    gas: 4500000,
    gasPrice: 10000000000,
    nonce
  })
  console.log(result)

  const computedAddr = buildCreate2Address(
    address,
    numberToUint256(salt),
    bcode
  )

  const addr = result.events.Deployed.returnValues.addr.toLowerCase()
  assert.equal(addr, computedAddr)

  return {
    txHash: result.transactionHash,
    address: addr,
    receipt: result
  }
}

async function buildAccountAddress (salt, recipient, amount) {
  const bcode = `${bytecode}${encodeParam('address', recipient).slice(2)}${encodeParam('uint256', amount).slice(2)}`
  return buildCreate2Address(
    address,
    numberToUint256(salt),
    bcode
  )
}

function waitForDeployEvent (address) {
  const factory = new web3.eth.Contract(abi, address)

  return new Promise((resolve, reject) => {
    factory.events.allEvents((error, log) => {
      if (error) return reject(error)
      resolve(log)
    })
  })
}

async function deploySpotethfyContract (salt, aliceContractAddress) {
  // doing it this way so that contracts can be redeployed without having to restart server
  const Spotethfy  = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../channel-contracts/build/contracts/Spotethfy.json')).toString())
  const factory = new web3.eth.Contract(abi, address)
  const account = '0xb2b0f76ece233b8e4bb318e9d663bead67060ca8'
  const nonce = await web3.eth.getTransactionCount(account)
  const bytecode = `${Spotethfy.bytecode}${encodeParam('address', aliceContractAddress).slice(2)}`
  const result = await factory.methods.deploy(bytecode, salt).send({
    from: account,
    gas: 4500000,
    gasPrice: 10000000000,
    nonce
  })
  console.log(result)

  const computedAddr = buildCreate2Address(
    address,
    numberToUint256(salt),
    bytecode
  )

  const addr = result.events.Deployed.returnValues.addr.toLowerCase()
  assert.equal(addr, computedAddr)

  return {
    txHash: result.transactionHash,
    address: addr,
    receipt: result
  }
}

module.exports = {
  address,
  deployContract,
  buildAccountAddress,
  waitForDeployEvent,
  deploySpotethfyContract
}
