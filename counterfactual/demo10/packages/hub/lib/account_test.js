const moment = require('moment')
const {removeRecovery,getOwner} = require('./account')
const {isContract, web3, fromEth, getBalance} = require('./helpers')
const {deploySpotethfyContract} = require('./factory')

// TODO: tests

const contractAddress = '0x80c5f5ce01aeba3afce868e42a1857308c8fd905'
const signer = '0xb2b0f76eCE233B8E4BB318E9d663BEAd67060cA8'

async function main() {
  console.log(await isContract(contractAddress))
  console.log(await getOwner(contractAddress))
  try {
    const result = await removeRecovery(contractAddress, signer)
    console.log(result)
  } catch(err) {
    console.log(err)
  }
}

// main()

async function main2() {
  const { abi, networks } = require('channel-contracts/build/contracts/Account.json')
  const { address } = networks[Object.keys(networks)[0]]
  const signer = '0xb2b0f76ece233b8e4bb318e9d663bead67060ca8'

  try {
    web3.eth.sendTransaction({
      to: address,
      value: fromEth(6),
      from: signer,
    })

    const instance = new web3.eth.Contract(abi, address)
    const subscriber = '0xb2b0f76ece233b8e4bb318e9d663bead67060ca8'
    console.log('hi')
    const result = await instance.methods.subscribe(subscriber).send({
      from: signer
    })

    console.log(result)

    const result2 = await instance.methods.cancelSubscription(subscriber).send({
      from: signer
    })

    console.log(result2)

    const result3 = await instance.methods.withdraw().send({
      from: subscriber
    })

    console.log(result3)

    const bal = await getBalance(subscriber)
    console.log(bal)
  } catch(err) {
    console.log(err)
  }
}

//main2()

function main3() {
  var startDate = moment().add(-30, 'seconds').unix()
  var closeDate = moment().unix()
  var elapsedMinutes = (closeDate - startDate) / 60
  var amount = 0
  var max = 6

  for (var i = 0; i < elapsedMinutes; i++) {
    if (amount >= max) {
      break
    }

    amount = amount + 1
  }

  console.log(amount)
}

//main3()

async function main4() {
  const { abi } = require('channel-contracts/build/contracts/Account.json')
  const signer = '0xb2b0f76ece233b8e4bb318e9d663bead67060ca8'
  const address = '0xe1409fd3692ef21808a72da8191bf1162cddcacd'

  try {
    const instance = new web3.eth.Contract(abi, address)
    const subscriber = '0x062f35054efbfb33bfcb5f986ddfda4b506ed7ab'

    const result = await instance.methods.withdraw(subscriber).send({
      from: signer
    })

    console.log(result)
  } catch(err) {
    console.log(err)
  }
}

//main4()


async function main5() {
  try {
    const salt = 13
    const result = await deploySpotethfyContract(salt)
    console.log(result)
    console.log('done')
  } catch(err) {
    console.log(err)
  }
}

//main5()

async function main6() {
  const { abi } = require('channel-contracts/build/contracts/Spotethfy.json')
  const address = '0xedcad1dfea277957c113a32a8b8397fc8c8b4d84'

  try {
    const instance = new web3.eth.Contract(abi, address)

    const result = await instance.methods.aliceContract().call()

    console.log(result)
  } catch(err) {
    console.log(err)
  }
}

//main6()

