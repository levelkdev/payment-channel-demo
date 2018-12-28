import React, { Component } from 'react';
import styled from 'styled-components'
import moment from 'moment'
import { connect } from 'react-redux'
import { deployContract, subscriptionStatus } from './actions'
import {
  getBalance,
  toEth,
  addSubscriber,
  cancelSubscription,
  getConnectedAccount,
  withdrawalAmount,
  withdraw,
  buildSpotethfyAddress,
  getModels,
  isContract,
  mineEmptyBlock,
  destructSpotethfy
} from './utils'

// POC

// TODO: use actions, clean up

const UI = {
  Header: styled.div`
    font-size: 1.1em;
    margin-bottom: 2em;
    font-weight: bold;
  `,
  Container: styled.div`
    width: 100%;
    max-width: 500px;
    margin: 0 auto;
  `,
  Form: styled.form`
    display: block;
  `,
  Field: styled.div`
    display: block;
    margin-bottom: 1em;
  `,
  Input: styled.input`
    display: block;
    width: 100%;
    padding: 0.2em;
    font-size: 1em;
  `,
  Label: styled.div`
    display: block;
    margin-bottom: 0.5em;
    font-size: 0.8em;
    font-weight: bold;
    margin-bottom: 0.2em;
  `,
  Output: styled.output`
    font-size: 1em;
    display: block;
    margin: 0 auto;
    background: #f9f8f6;
    padding: 1em;
    margin-bottom: 1em;
    white-space: pre;
    overflow: auto;
  `,
  Error: styled.div`
    width: 100%;
    color: red;
    text-align: center;
    padding: 1em;
  `,
  Actions: styled.div`
    text-align: center;
    margin-bottom: 1em;
  `,
  Button: styled.button`
    cursor: pointer;
    &[disabled] {
      cursor: default;
      -webkit-appearance: none;
      opacity: 0.4;
    }
  `,
  Notice: styled.div`
    font-size: 0.8em;
  `
}

class App extends Component {
  constructor() {
    super()
    this.state = {
      salt: 51, // TODO: fetch from server
      subscriberAddress: null,
      subscriberBalance: 0,
      isDeployed: false,
      estimatedAmount: 0,
      recipientBalance: 0
    }
  }

  async componentDidMount() {
    setTimeout(async () => {
      const subscriberAddress = await this.getSubscriberAddress()
      this.setState({
        subscriberAddress
      })
    }, 1e3)

    setInterval(async () => {
      this.props.getSubscriptionStatus(this.props.contractAddress, this.state.subscriberAddress)

      const bal = await getBalance(this.state.subscriberAddress)
      this.setState({
        subscriberBalance: bal.toString(),
        isDeployed: await isContract(this.state.subscriberAddress)
      })

      this.setState({
        recipientBalance: await getBalance('0xb2b0f76eCE233B8E4BB318E9d663BEAd67060cA8')
      })

      this.calcAmount()

      const result = await withdrawalAmount(this.props.contractAddress, this.state.subscriberAddress)
      console.log('withdrawalAmount', toEth(result))
    }, 3e3)
  }

  async getSubscriberAddress() {
    return buildSpotethfyAddress(this.state.salt, this.props.contractAddress)
  }

  async subscribe() {
    const signer = getConnectedAccount()
    const result = await addSubscriber(this.props.contractAddress, this.state.subscriberAddress, signer)

    console.log(result)
  }

  async cancelSubscription() {
    const signer = getConnectedAccount()
    const result = await cancelSubscription(this.props.contractAddress, this.state.subscriberAddress, signer)

    console.log(result)
  }

  async deploySpotethfy() {
    const result = await getModels().spotethfy.deployContract({
      contractAddress: this.state.subscriberAddress,
      aliceContractAddress: this.props.contractAddress,
      salt: this.state.salt
    })

    console.log(result)
  }

  async withdraw() {
    const signer = getConnectedAccount()
    const result = await withdraw(this.props.contractAddress, this.state.subscriberAddress, signer)
    console.log(result)
  }

  async destructSpotethfy() {
    const signer = getConnectedAccount()
    const result = await destructSpotethfy(this.state.subscriberAddress, signer)
    console.log(result)
  }

  async calcAmount() {
    if (!this.props.subscriptionStatus) return
    if (this.props.subscriptionStatus.completed) {
      this.setState({
        estimatedAmount: 0
      })
      return
    }
    var startDate = parseInt(this.props.subscriptionStatus.startDate, 10)
    if (!startDate) startDate = moment().unix()
    var closeDate = parseInt(this.props.subscriptionStatus.closeDate, 10)
    if (!closeDate) closeDate = moment().unix()
    var elapsedMinutes = (closeDate - startDate) / 60
    var amount = 0
    // TODO: pull dynamic
    var max = parseInt(toEth(this.props.subscriptionStatus.max||0), 10)
    var limit = parseInt(toEth(this.props.subscriptionStatus.limit||0), 10)

    for (var i = 0; i < elapsedMinutes; i++) {
      if (amount >= max) {
        break
      }

      amount += limit
    }

    amount = amount - toEth(this.props.subscriptionStatus.withdrawn)

    this.setState({
      estimatedAmount: amount
    })
  }

  async mineEmptyBlock() {
    const signer = getConnectedAccount()
    const result = await mineEmptyBlock(signer)
    console.log(result)
  }

  render() {
    const { subscriberBalance, subscriberAddress, estimatedAmount, isDeployed, recipientBalance } = this.state
    const subscriptionStatus = this.props.subscriptionStatus || {}
    const startDisabled = subscriptionStatus.active
    const stopDisabled = !subscriptionStatus.active
    const deployDisabled = isDeployed
    const allowedTotal = toEth(subscriptionStatus.max)
    const allowedLimit = toEth(subscriptionStatus.limit)

    return (
      <UI.Container>
        <UI.Header>
          Deploy
        </UI.Header>
        <UI.Form onSubmit={event => {
          event.preventDefault()
        }}>
          <UI.Field>
            <UI.Label>subscriber balance</UI.Label>
            {toEth(subscriberBalance)}
          </UI.Field>
          <UI.Field>
            <UI.Label>subscriber self destruct recipient balance</UI.Label>
            {toEth(recipientBalance)}
          </UI.Field>
          <UI.Field>
            <UI.Label>withdrawable amount</UI.Label>
            {estimatedAmount}
          </UI.Field>
          <UI.Field>
            <UI.Label>subscriber contract address</UI.Label>
            {subscriberAddress}
          </UI.Field>
          <UI.Field>
            <UI.Label>subscriber contract deployed</UI.Label>
            {`${isDeployed}`}
          </UI.Field>
          <UI.Field>
            <UI.Label>subscription status</UI.Label>
            <UI.Output>
            {JSON.stringify(subscriptionStatus, null, 2)}
            </UI.Output>
          </UI.Field>
          <UI.Field>
            <UI.Label>subscription limits</UI.Label>
            {allowedTotal} ETH total | {allowedLimit} ETH per min
          </UI.Field>
          <UI.Actions>
            <UI.Button type="submit" onClick={() => this.subscribe()} disabled={startDisabled}>
              Spotethfy subscription
            </UI.Button>
            <UI.Button type="submit" onClick={() => this.withdraw()}>
              Spotethfy withdraw
            </UI.Button>
            <UI.Button type="submit" onClick={() => this.cancelSubscription()} disabled={stopDisabled}>
              Stop Spotethfy subscription
            </UI.Button>
            <UI.Button type="submit" onClick={() => this.deploySpotethfy()} disabled={deployDisabled}>
              Hub deploy spotethfy contract
            </UI.Button>
            <UI.Button type="submit" onClick={() => this.destructSpotethfy()}>
              Spotethfy self destruct
            </UI.Button>
            <UI.Button type="submit" onClick={() => this.mineEmptyBlock()}>
              Mine empty block
            </UI.Button>
          </UI.Actions>
        </UI.Form>
      </UI.Container>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    balance: state.balance,
    userId: state.userId,
    contractAddress: state.contractAddress,
    subscriptionStatus: state.subscriptionStatus,
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    deployContract: (userId) => dispatch(deployContract(userId)),
    getSubscriptionStatus: (contractAddress, subscriber) => dispatch(subscriptionStatus(contractAddress, subscriber)),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(App)
