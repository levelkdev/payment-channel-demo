import Web3 from 'web3'
import detectNetwork from 'web3-detect-network'
const web3 = new Web3()
const BN = require('bn.js')

// POC

// TODO: break up into sub utils and write tests

export function toBig (n) {
  return new BN(n.toString(10))
}

const contractJSON = require('channel-contracts/build/contracts/Account.json')
const { abi, networks } = contractJSON
let address;
let network = networks[Object.keys(networks)[0]]
if (network) {
  address = network.address
}

const Spotethfy = require('channel-contracts/build/contracts/Spotethfy.json')

export function sha3 (data) {
  return web3.utils.sha3(data)
}

export function getWeb3 () {
  return web3
}

export function toWei (value) {
  return web3.utils.toWei(`${value || 0}`, 'ether')
}

export function toEth (value) {
  return web3.utils.fromWei(`${value || 0}`, 'ether')
}

export function getModels () {
  return window.loopbackApp.models
}

export function getContractAddress () {
  return address
}

export function getContractAbi () {
  return abi
}

export function getWindowWeb3 () {
  return window.web3
}

export function isMetamaskConnected () {
  const web3 = getWindowWeb3()
  if (!web3) return false
  return web3.currentProvider && web3.currentProvider && web3.currentProvider.isConnected()
}

export function getProvider () {
  const defaultProvider = web3.providers.HttpProvider('http://localhost:8545')
  const w3 = getWindowWeb3()
  if (!w3) return defaultProvider
  return w3.currentProvider
}

export function getConnectedAccount () {
  return isMetamaskConnected() && getWindowWeb3().eth.defaultAccount
}

export async function getConnectedNetwork () {
  return detectNetwork(getProvider())
}

export async function getBalance (account) {
  return new Promise((resolve, reject) => {
    getWindowWeb3().eth.getBalance(account, (err, result) => {
      if (err) return reject(err)
      resolve(result)
    })
  })
}

export async function openChannel (opts) {
  const { value, hub, timeout, account } = opts
  const web3 = new Web3(getProvider())
  const instance = new web3.eth.Contract(abi, address)
  const result = await instance.methods.deposit(hub, timeout).send({
    from: account,
    value
  })

  return result
}

export async function getChannelBalance (payer) {
  /*
  const web3 = new Web3(getProvider())
  const instance = new web3.eth.Contract(abi, address)
  const result = await instance.methods.payers(payer).call()

  return toBig(result.amount)
  */
  return toBig(0)
}

export function getTestAddresses () {
  const addresses = {
    alice: '0xc776e37126bc5fa0e12e775416bb59e4884f8b2f',
    bob: '0xac59d9c3f5d94becf12afa90b8c1dd3257039334',
    chad: '0xb829eea8382c9e3d8b0f07b879bd885d8c9778fc',
    dan: '0x17e9fd828204a374c739a4b8e5c8d8dba2396056'
  }

  return addresses
}

export function getTestAddress (user) {
  return getTestAddresses()[user]
}

export async function signMessage (text) {
  const web3 = getWindowWeb3()
  return new Promise((resolve, reject) => {
    web3.personal.sign(web3.fromUtf8(text), getConnectedAccount(), (err, sig) => {
      if (err) return reject(err)
      resolve(sig)
    })
  })
}

export async function addSubscriber(contractAddress, subscriber, signer) {
  const web3 = new Web3(getProvider())
  const instance = new web3.eth.Contract(abi, contractAddress)

  const result = await instance.methods.subscribe(subscriber).send({
    from: signer
  })

  return result
}

export async function cancelSubscription(contractAddress, subscriber, signer) {
  const web3 = new Web3(getProvider())
  const instance = new web3.eth.Contract(abi, contractAddress)

  const result = await instance.methods.cancelSubscription(subscriber).send({
    from: signer
  })

  return result
}

export async function withdrawalAmount(contractAddress, subscriber, signer) {
  const web3 = new Web3(getProvider())
  const instance = new web3.eth.Contract(abi, contractAddress)

  const result = await instance.methods.withdrawalAmount(subscriber).call()

  return result
}

export async function withdraw(contractAddress, subscriber, signer) {
  const web3 = new Web3(getProvider())
  const instance = new web3.eth.Contract(abi, contractAddress)
  const result = await instance.methods.withdraw(subscriber).send({
    from: signer
  })

  return result
}

export function numberToUint256 (value) {
  let result = null

  try {
    const hex = value.toString(16)
    result = `${'0'.repeat(64 - hex.length)}${hex}`
  } catch (err) {
    result = null
  }

  return result
    ? `0x${result}`
    : '0x'
}

export function buildCreate2Address (creatorAddress, saltHex, byteCode) {
  const parts = [
    'ff',
    creatorAddress,
    saltHex,
    web3.utils.sha3(byteCode)
  ].map((part) => part.startsWith('0x')
    ? part.slice(2)
    : part
  )

  const partsHash = web3.utils.sha3(`0x${parts.join('')}`)

  return `0x${partsHash.slice(-40)}`.toLowerCase()
}

export function buildSpotethfyAddress(salt, aliceContractAddress) {
  const contractJSON = require('channel-contracts/build/contracts/Factory.json')
  const { networks } = contractJSON
  const { address } = networks[Object.keys(networks)[0]]
  const creator = address
  const bytecode = `${Spotethfy.bytecode}${encodeParam('address', aliceContractAddress).slice(2)}`
  return buildCreate2Address(creator, numberToUint256(salt), bytecode)
}

export async function subscriberStatus(contractAddress, subscriber) {
  const web3 = new Web3(getProvider())
  const instance = new web3.eth.Contract(abi, contractAddress)

  const result = await instance.methods.subscriptions(subscriber).call()

  return result
}

export async function destructSpotethfy(subscriberAddress, signer) {
  const web3 = new Web3(getProvider())
  const instance = new web3.eth.Contract(Spotethfy.abi, subscriberAddress)
  const result = await instance.methods.close().send({
    from: signer
  })

  return result
}

export async function mineEmptyBlock(signer) {
  const web3 = new Web3(getProvider())
  const result = web3.eth.sendTransaction({
    to: signer,
    from: signer,
    value: 0
  })

  return result
}

export function encodeParam(dataType, data) {
  return web3.eth.abi.encodeParameter(dataType, data);
}

export async function isContract (address) {
  const web3 = new Web3(getProvider())
  const code = await web3.eth.getCode(address)
  return code.slice(2).length > 0
}
