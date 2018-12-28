'use strict'

const assert = require('assert')

const {
  getBalance,
  isContract,
  getHubAccount,
  ecRecover,
  sha3String,
  toWei,
} = require('../../lib/helpers')
const {
  buildAccountAddress,
  deployContract
} = require('../../lib/factory')
const {
  setRecovery,
  removeRecovery
} = require('../../lib/account')
const {
  sendMail
} = require('../../lib/mail')

const watchers = {}

async function spawnWatcher (user) {
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
      if (bal !== oldBal) {
        user.updateAttribute('balance', bal, (err) => {
          if (err) {
            console.log(err)
          }
        })
      }

      oldBal = bal
    } catch (err) {

    }
  }
  await updateBal()
  // TODO: use events
  setInterval(async () => {
    updateBal()
  }, 3e3)
}

function contractWatcher() {
  // TODO
  // 1. watch for alice cancel event
  // 2. deploy Spotethfy contract
}

module.exports = function (User) {
  User.settings.caseSensitiveEmail = false

  User.validatesUniquenessOf('email')

  User.observe('before save', async (ctx, next) => {
    if (!ctx.isNewInstance) {
      return next()
    }

    // deterministic salt based on email (for testing)
    const salt = parseInt(sha3String(ctx.instance.email).slice(0,5), 16)

    // part of demo6
    const recipient = '0xaC59D9C3f5d94bEcF12aFA90b8c1Dd3257039334'
    // part of demo6
    const amount = toWei(1)

    ctx.instance.contractAddress = await buildAccountAddress(salt, recipient, amount)
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
          if (err) {
            return resolve({
              error: err.message
            })
          }
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
    } catch (err) {
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
        http: function (ctx) {
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
      }
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
      if (err) {
        throw err
      }
      spawnWatcher(user)
      next()
    })
  })

  User.deployContract = async (payload) => {
    try {
      const { userId, recipient, amount } = payload

      return new Promise((resolve, reject) => {
        User.findById(userId, async (err, user) => {
          if (err) {
            return reject(err.message)
          }

          assert.ok(!(await isContract(user.contractAddress)))

          const {txHash, address} = await deployContract(user.salt, recipient, amount)

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
    } catch (err) {
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

  User.on('resetPasswordRequest', async (info) => {
    const { email, accessToken } = info
    const {id: token} = accessToken

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

  User.setRecoveryAddress = async (accessToken, _, recoveryAddress) => {
    try {
      const signer = await getHubAccount()

      if (!accessToken) {
        throw Error('access token is required')
      }

      return new Promise((resolve, reject) => {
        User.findById(accessToken.userId, async (err, user) => {
          if (err) {
            return resolve({
              error: err.message
            })
          }
          const result = await setRecovery(user.contractAddress, recoveryAddress, signer)
          assert.equal(result.status, true)

          user.updateAttribute('recoveryAddress', recoveryAddress, async (err, user) => {
            if (err) {
              return resolve({
                error: err.message
              })
            }

            const text = `Recovery key ${recoveryAddress} was added to your account. You can revoke this action at any time`

            await sendMail({
              to: user.email,
              from: 'no-reply@example.com',
              subject: 'Recovery address added',
              text,
              html: text
            })

            resolve(true)
          })
        })
      })
    } catch (err) {
      throw Error(err.message)
    }
  }

  User.remoteMethod('setRecoveryAddress', {
    isStatic: true,
    accepts: [
      {
        arg: 'accessToken',
        type: 'object',
        http: function (ctx) {
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
        arg: 'recoveryAddress',
        type: 'string',
        required: true
      }
    ],
    http: {
      path: '/recovery-address',
      verb: 'post'
    },
    returns: {
      type: 'boolean',
      arg: 'recoveryAddressChanged'
    }
  })

  User.removeRecoveryAddress = async (accessToken, _) => {
    try {
      const signer = await getHubAccount()

      if (!accessToken) {
        throw Error('access token is required')
      }

      return new Promise((resolve, reject) => {
        User.findById(accessToken.userId, async (err, user) => {
          if (err) {
            return resolve({
              error: err.message
            })
          }

          const result = await removeRecovery(user.contractAddress, signer)
          assert.equal(result.status, true)

          user.updateAttribute('recoveryAddress', null, async (err, user) => {
            if (err) {
              return resolve({
                error: err.message
              })
            }

            const text = `Recovery key removed from your account and hub can no longer help with fund recovery`

            await sendMail({
              to: user.email,
              from: 'no-reply@example.com',
              subject: 'Recovery address removed',
              text,
              html: text
            })

            resolve(true)
          })
        })
      })
    } catch (err) {
      throw Error(err.message)
    }
  }

  User.remoteMethod('removeRecoveryAddress', {
    isStatic: true,
    accepts: [
      {
        arg: 'accessToken',
        type: 'object',
        http: function (ctx) {
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
        arg: 'key',
        type: 'string',
      }
    ],
    http: {
      path: '/remove-recovery-address',
      verb: 'post'
    },
    returns: {
      type: 'boolean',
      arg: 'recoveryAddressRemoved'
    }
  })

  User.loginMetamask = async (payload) => {
    try {
      const { signature, account } = payload
      // TODO: generate dynamic nonce for user to sign
      const nonce = '123'

      const addr = ecRecover(signature, nonce)
      assert.equal(addr, account)

      return new Promise((resolve, reject) => {
        User.findOne({where: {recoveryAddress: addr}}, async (err, user) => {
          if (err) return reject(err)
          if (!user) return reject(Error('user not found'))

          user.createAccessToken({
            ttl: -1
          }, (err, obj) => {
            if (err) return reject(err)
            resolve(obj)
          })
        })
      })
    } catch (err) {
      throw Error(err.message)
    }
  }

  User.remoteMethod('loginMetamask', {
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
      path: '/login-metamask',
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
