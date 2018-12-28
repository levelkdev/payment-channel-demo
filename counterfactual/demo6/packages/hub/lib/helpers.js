const Web3 = require('web3')
const {soliditySha3: sha3} = require('web3-utils')
const util = require('ethereumjs-util')
const BN = require('bn.js')

const toBig = (n) => new BN(n.toString(10))

const provider = new Web3.providers.HttpProvider('http://localhost:8545')
const web3 = new Web3(provider)

function extractRSV(sig) {
  sig = sig.substr(2); // strip prefix
  const r = '0x' + sig.slice(0, 64);
  const s = '0x' + sig.slice(64, 128);
  const v = web3.utils.toDecimal(sig.slice(128, 130)) + 27

  return {
    r,
    s,
    v,
  }
}

async function sign(msg, account, _web3) {
  let w3 = _web3 || web3

  let sig = await w3.eth.sign(msg, account)
  const {r, s, v} = extractRSV(sig)

  return {
    sig,
    r,
    s,
    v,
  }
}

function prefixMsg(hash) {
  hash = Buffer.from(hash.slice(2), 'hex')
  const prefix = new Buffer('\x19Ethereum Signed Message:\n')
  const msg = '0x' + util.keccak256(
    Buffer.concat([prefix, new Buffer(String(hash.length)), hash])
  ).toString('hex')
  return msg
}

function getConnector(Model) {
  return Model.app.models.Channel.dataSource.connector
}

function getWeb3(Model) {
  const con = getConnector(Model)
  return con && con.web3 ? con.web3 : web3
}

async function getAccount(web3, index) {
  return (await web3.eth.getAccounts())[index>>0]
}

async function getHubAccount() {
  return (await web3.eth.getAccounts())[0]
}

async function getBalance(account) {
  return new Promise((resolve, reject) => {
    web3.eth.getBalance(account, (err, result) => {
      if (err) return reject(err)
      resolve(result)
    })
  })
}

function toWei(value) {
  return web3.utils.toWei(`${value||0}`, 'ether')
}

function toEth(value) {
  return web3.utils.fromWei(`${value||0}`, 'ether')
}

function fromEth(value) {
  return new BN(web3.utils.toWei(`${value||0}`, 'ether').toString(10), 10)
}

function numberToUint256(value) {
  let result = null;

  try {
    const hex = value.toString(16);
    result = `${'0'.repeat(64 - hex.length)}${hex}`;
  } catch (err) {
    result = null
  }

  return result
    ? `0x${result}`
    : '0x';
}

function buildCreate2Address(creatorAddress, saltHex, byteCode) {
  const parts = [
    'ff',
    creatorAddress,
    saltHex,
    web3.utils.sha3(byteCode),
  ].map((part) => part.startsWith('0x')
    ? part.slice(2)
    : part
  );

  const partsHash = web3.utils.sha3(`0x${parts.join('')}`);

  return `0x${partsHash.slice(-40)}`.toLowerCase();
}

async function isContract(address) {
  const code = await web3.eth.getCode(address)
  return code.slice(2).length > 0
}

module.exports = {
  getConnector,
  getWeb3,
  web3,
  sign,
  prefixMsg,
  sha3,
  getAccount,
  getBalance,
  toWei,
  toEth,
  fromEth,
  toBig,
  buildCreate2Address,
  numberToUint256,
  getHubAccount,
  isContract,
}
