'use strict';

const moment = require('moment')
const assert = require('assert')

const {
  prefixMsg,
  getAccount,
  getWeb3,
  toWei,
  toEth,
  fromEth,
  buildCreate2Address,
  getBalance,
  isContract,
} = require('../../lib/helpers')
const {
  buildAccountAddress,
  deployContract,
} = require('../../lib/factory')
const {
  sendMail
} = require('../../lib/mail')

function getUser(User, where) {
  return new Promise((resolve, reject) => {
    User.findOne({where}, (err, result) =>
      err ? reject(err) : resolve(result)
    )
  })
}

const watchers = {}

async function spawnWatcher(user) {
  if (watchers[user.id]) return
  watchers[user.id] = true
  let oldBal
  const updateBal = async () => {
    try {
      const bal = await getBalance(user.contractAddress)
      if (bal > 0 && user.contractStatus === 'reserved') {
        user.updateAttribute('contractStatus', 'ready', (err) => {
          if (err) {
            console.log(err)
          }
        })
      }
      if (bal != oldBal) {
        user.updateAttribute('balance', bal, (err) => {
          if (err) {
            console.log(err)
          }
        })
      }

      oldBal = bal
    } catch(err) {

    }
  }
  await updateBal()
  // TODO: use events
  setInterval(async () => {
    updateBal()
  }, 3e3)
}

module.exports = function(User) {
  User.settings.caseSensitiveEmail = false

  User.validatesUniquenessOf('email')

  User.observe('before save', async (ctx, next) => {
    if (!ctx.isNewInstance) {
      return next()
    }

    const salt = Date.now()

    ctx.instance.contractAddress = await buildAccountAddress(salt)
    ctx.instance.salt = salt
    ctx.instance.contractStatus = 'reserved'

    next()
  })

  User.updatePasswordFromToken = async (accessToken, _, newPassword) => {
    try {
      if (!accessToken) {
        throw Error('access token is required')
      }

      return new Promise((resolve, reject) => {
        User.findById(accessToken.userId, (err, user) => {
          user.updateAttribute('password', newPassword, (err, user) => {
            if (err) {
              return resolve({
                error: err.message
              })
            }

            resolve(true)
          })
        })
      })
    } catch(err) {
      return {
        error: err.message
      }
    }
  }

  User.remoteMethod('updatePasswordFromToken', {
    isStatic: true,
    accepts: [
      {
        arg: 'accessToken',
        type: 'object',
        http: function(ctx) {
          return ctx.req.accessToken
        }
      },
      {
        arg: 'access_token',
        type: 'string',
        required: true,
        'http': { source: 'query' }
      },
      {
        arg: 'newPassword',
        type: 'string',
        required: true
      },
    ],
    http: {
      path: '/update-password-from-token',
      verb: 'post'
    },
    'accessScopes': ['reset-password'],
    returns: {
      type: 'boolean',
      arg: 'passwordChanged'
    }
  })

  User.afterRemote('login', (ctx, user, next) => {
    User.findById(ctx.result.userId, async (err, user) => {
      spawnWatcher(user)
      next()
    })
  })

  User.deployContract = async (payload) => {
    try {
      const { userId } = payload

      return new Promise((resolve, reject) => {
        User.findById(userId, async (err, user) => {
          if (err) {
            return reject(err.message)
          }

          assert.ok(!(await isContract(user.contractAddress)))

          const {txHash, address} = await deployContract(user.salt)

          assert.equal(user.contractAddress, address)
          assert.ok(await isContract(address))

          user.updateAttribute('contractStatus', 'active', (err) => {
            if (err) {
              console.log(err)
            }
          })

          resolve({txHash, address})
        })
      })
    } catch(err) {
      throw Error(err.message)
    }
  }

  User.remoteMethod('deployContract', {
    isStatic: true,
    accepts: [
      {
        arg: 'data',
        description: 'JSON payload',
        type: 'object',
        http: {source: 'body'},
        required: true,
      },
    ],
    http: {path: '/deploy-contract', verb: 'post'},
    returns: [
      {
        arg: 'data',
        type: 'object',
        root: true,
      },
    ]
  })

  User.on('resetPasswordRequest', async (info) => {
    const { email, accessToken } = info
    const {id:token} = accessToken

    const url = `http://localhost:8080/reset-password?access_token=${token}`
    console.log(url)

    const text = `Reset password: ${url}`

    await sendMail({
      to: email,
      from: 'no-reply@example.com',
      subject: 'Reset password',
      text,
      html: text
    })
  })
}
