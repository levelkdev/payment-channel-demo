const {
  deployContract,
  buildAccountAddress,
  waitForDeployEvent
} = require('./factory')

const {
  isContract,
  getBalance,
  toEth
} = require('./helpers')

const salt = 10
async function wait() {
  const address = await buildAccountAddress(salt)
  const event = await waitForDeployEvent(address)
  console.log(event)
}

async function main() {
  try {
    const address = await buildAccountAddress(salt)

    console.log(await isContract(address))
    console.log(address)

    const bal = await getBalance(address)
    console.log(bal)
    return

    const result = await deployContract(salt)
    console.log(result.address)
    console.log(await isContract(result.address))

    const bal1 = await getBalance(address)
    console.log(bal1)
  } catch(err) {
    console.log(err.message)
  }
}

//wait()
main()
