'use strict'

const assert = require('assert')

const {
  deploySpotethfyContract
} = require('../../lib/factory')
const {
  isContract
} = require('../../lib/helpers')

module.exports = function (Spotethfy) {
  Spotethfy.deployContract = async (payload) => {
    try {
      const { contractAddress, salt } = payload

      //assert.ok(!(await isContract(contractAddress)))

      const {txHash, address} = await deploySpotethfyContract(salt)
      //assert.equal(contractAddress, address)
      //assert.ok(await isContract(address))

      return {txHash, address}
    } catch (err) {
      console.log(err)
      throw Error(err.message)
    }
  }

  Spotethfy.remoteMethod('deployContract', {
    isStatic: true,
    accepts: [
      {
        arg: 'data',
        description: 'JSON payload',
        type: 'object',
        http: {source: 'body'},
        required: true
      }
    ],
    http: {
      path: '/deploy-contract',
      verb: 'post'
    },
    returns: [
      {
        arg: 'data',
        type: 'object',
        root: true
      }
    ]
  })
}
