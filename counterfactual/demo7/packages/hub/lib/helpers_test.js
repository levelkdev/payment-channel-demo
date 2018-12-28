const {
  buildCreate2Address,
  numberToUint256,
} = require('./helpers')

const {bytecode} = require('channel-contracts/build/contracts/Channel.json')

const creatorAddress = '0xc776E37126Bc5fa0e12e775416bB59E4884F8B2f'

const salt = 1

const contractAddress = buildCreate2Address(
  creatorAddress,
  numberToUint256(salt),
  bytecode,
)

console.log(contractAddress) // 0x3ecba4f4fb671afef7fd2489923dc3b60fc3853a
