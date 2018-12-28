const Web3 = require('web3')
const assert = require('assert')
const BN = require('bn.js')

const {
  sha3,
  buildCreate2Address,
  numberToUint256,
  getHubAccount,
} = require('./helpers')

const big = (n) => new BN(n.toString(10))

const { abi, networks } = require('channel-contracts/build/contracts/Factory.json')
const Account = require('channel-contracts/build/contracts/Account.json')
const { bytecode } = Account
const { address } = networks[Object.keys(networks)[0]]

//const provider = new Web3.providers.HttpProvider('http://localhost:8545')

const HDWalletProvider = require('truffle-hdwallet-provider')

const url = 'http://localhost:8545'
//const url = 'ws://localhost:8546'

const provider = new HDWalletProvider(
  'purse alien once arrive fitness deposit visa token sun brick intact slam',
  url,
)

const web3 = new Web3(provider)

async function deployContract(salt, recipient, amount) {
  const factory = new web3.eth.Contract(abi, address)
  const account = '0xb2b0f76ece233b8e4bb318e9d663bead67060ca8'
  const nonce =  await web3.eth.getTransactionCount(account)
  const result = await factory.methods.deploy(bytecode, salt).send({
    from: account,
    gas: 4500000,
    gasPrice: 10000000000,
    nonce,
  })
  console.log(result)

  const computedAddr = buildCreate2Address(
    address,
    numberToUint256(salt),
    bytecode,
  )

  const addr = result.events.Deployed.returnValues.addr.toLowerCase()
  assert.equal(addr, computedAddr)

  return {
    txHash: result.transactionHash,
    address: addr,
    receipt: result,
  }
}

async function buildAccountAddress(salt) {
  return buildCreate2Address(
    address,
    numberToUint256(salt),
    bytecode,
  )
}

function waitForDeployEvent(address) {
  const factory = new web3.eth.Contract(abi, address)

  return new Promise((resolve, reject) => {
    factory.events.allEvents((error, log) => {
      if (error) return reject(error)
      resolve(log)
    })
  })
}

module.exports = {
  address,
  deployContract,
  buildAccountAddress,
  waitForDeployEvent,
}
