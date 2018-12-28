import React, { Component } from 'react';
import styled from 'styled-components'
import moment from 'moment'
import { connect } from 'react-redux'
import { deployContract, subscriptionStatus } from './actions'
import {
  toWei,
  getBalance,
  toEth,
  addSubscriber,
  cancelSubscription,
  getConnectedAccount,
  withdrawalAmount,
  buildSpotethfyAddress,
  getModels,
  subscriberStatus,
  isContract
} from './utils'

const BN = require('bn.js')

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
  `,
  Notice: styled.div`
    font-size: 0.8em;
  `
}

class App extends Component {
  constructor() {
    super()
    this.state = {
      salt: 11, // TODO: fetch from server
      subscriberAddress: null,
      subscriberBalance: 0,
      isDeployed: false
    }
  }

  async componentDidMount() {
    setTimeout(async () => {
      const subscriberAddress = await this.getSubscriberAddress()
      this.setState({
        subscriberAddress
      })
      //const result = await withdrawalAmount(this.props.contractAddress, subscriber)
      //console.log('withdrawalAmount', toEth(result))
    }, 1e3)

    setInterval(async () => {
      this.props.getSubscriptionStatus(this.props.contractAddress, this.state.subscriberAddress)

      const bal = await getBalance(this.state.subscriberAddress)
      this.setState({
        subscriberBalance: bal.toString(),
        isDeployed: await isContract(this.state.subscriberAddress)
      })

      this.calcAmount()
    }, 3e3)
  }

  async getSubscriberAddress() {
    return buildSpotethfyAddress(this.state.salt)
  }

  async subscribe() {
    const signer = getConnectedAccount()
    const result = await addSubscriber(this.props.contractAddress, this.state.subscriberAddress, signer)

    console.log(result)
  }

  async cancelSubscription() {
    const subscriber = await this.getSubscriberAddress()
    const signer = getConnectedAccount()
    const result = await cancelSubscription(this.props.contractAddress, this.state.subscriberAddress, signer)

    console.log(result)
  }

  async deploySpotethfy() {
    const {id: sessionId, userId} = await getModels().spotethfy.deployContract({
      contractAddress: this.state.subscriberAddress,
      salt: this.state.salt
    })
  }

  async calcAmount() {
    if (!this.props.subscriptionStatus) return
    var startDate = parseInt(this.props.subscriptionStatus.startDate, 10)
    var closeDate = parseInt(this.props.subscriptionStatus.closeDate, 10)
    if (!closeDate) closeDate = moment().unix()
    var elapsedMinutes = (closeDate - startDate) / 60
    var amount = 0
    var max = 6

    for (var i = 0; i < elapsedMinutes; i++) {
      if (amount >= max) {
        break
      }

      amount = amount + 1
    }

    console.log('amount', amount)
  }

  render() {
    const { subscriberBalance, subscriberAddress } = this.state
    const subscriptionStatus = this.props.subscriptionStatus || {}
    const startDisabled = subscriptionStatus.active
    const stopDisabled = !subscriptionStatus.active
    const deployDisabled = !(!subscriptionStatus.active && !this.state.isDeployed)

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
            <UI.Label>subscriber address</UI.Label>
            {subscriberAddress}
          </UI.Field>
          <UI.Field>
            <UI.Label>subscription status</UI.Label>
            {JSON.stringify(subscriptionStatus, null, 2)}
          </UI.Field>
          <UI.Field>
            <UI.Label>subscription limits</UI.Label>
            6 ETH total | 1 ETH per min
          </UI.Field>
          <UI.Actions>
            <UI.Button type="submit" onClick={() => this.subscribe()} disabled={startDisabled}>
              Spotethfy subscription
            </UI.Button>
            <UI.Button type="submit" onClick={() => this.cancelSubscription()} disabled={stopDisabled}>
              Stop Spotethfy subscription
            </UI.Button>
            <UI.Button type="submit" onClick={() => this.deploySpotethfy()} disabled={deployDisabled}>
              Hub deploy spotethfy contract
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
