const Account = artifacts.require('Account')
const moment = require('moment')
const BN = require('bn.js')
const {soliditySha3: sha3} = require('web3-utils')
const util = require('ethereumjs-util')
const {
  buildCreate2Address,
  numberToUint256,
} = require('./utils')

const big = (n) => new BN(n.toString(10))
const tenPow18 = big(10).pow(big(18))
const oneEth = big(1).mul(tenPow18).toString(10)

contract('Account', (accounts) => {
  const alice = accounts[0]
  const gasPrice = big(25000000000)

  describe('should deploy', () => {
    it('should deploy contract', async () => {

    })
  })
})
