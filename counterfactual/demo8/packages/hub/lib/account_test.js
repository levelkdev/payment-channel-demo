const {removeRecovery,getOwner} = require('./account')
const {isContract} = require('./helpers')

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

main()
