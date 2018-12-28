const Factory = artifacts.require('Factory')
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

  describe('deploy using create2', () => {
    it('should deploy contract', async () => {
      const factory = await Factory.deployed()
      const bytecode = Account.bytecode
      const salt = 1

      const contractAddress = buildCreate2Address(
        factory.address,
        numberToUint256(salt),
        bytecode,
      )

      const result = await factory.deploy(bytecode, salt, {
        from: alice
      })

      const example = await Account.at(result.logs[0].args.addr);

      assert.equal(result.receipt.status, '0x1')
      assert.equal(result.logs[0].args.addr, contractAddress)
    })

  })
})
