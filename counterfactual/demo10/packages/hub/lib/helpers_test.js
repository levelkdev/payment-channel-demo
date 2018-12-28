const util = require('ethereumjs-util')

// TODO: tests

const sig = '0x61ccfc296a126a71af50dd632e702f08f74ba7311c1a7cbcbdd8dc909f8f8f252ae4acbba214ad647911efef12c56af775cc94a134fdc2ab5a6e74d3011269161b'
const signatureBuffer = util.toBuffer(sig)
const {v, r, s} = util.fromRpcSig(signatureBuffer)
const nonce = '123'
// const msg = web3.utils.sha3(nonce)

// const msg = '0x64e604787cbf194841e7b68d7cd28786f6c9a0a3ab9f8b0a0e87cb4387ab0107'
const msgBuffer = util.toBuffer(nonce)
const msgHash = util.hashPersonalMessage(msgBuffer)

const pubKey = util.ecrecover(msgHash, v, r, s)
const addrBuf = util.pubToAddress(pubKey)
const addr = util.bufferToHex(addrBuf)
console.log(addr)
