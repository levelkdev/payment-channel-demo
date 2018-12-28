import React, { Component } from 'react';
import styled from 'styled-components'
import { connect } from 'react-redux'
import { deployContract } from './actions'
import {
  toWei,
  getBalance,
  toEth,
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
      recipient: '0xaC59D9C3f5d94bEcF12aFA90b8c1Dd3257039334',
      recipientBalance: 0,
      hub: '0xb2b0f76eCE233B8E4BB318E9d663BEAd67060cA8',
      hubBalance: 0,
      amount: 1,
    }


    this.updateBalance()
  }

  async deploy() {
    const { recipient, amount } = this.state
    await this.props.deployContract(this.props.userId, recipient, toWei(amount))

    setTimeout(() => {
      this.updateBalance()
    }, 1e3)
  }

  async updateBalance() {
    const recipientBalance = await getBalance(this.state.recipient)
    const hubBalance = await getBalance(this.state.hub)
    this.setState({
      recipientBalance,
      hubBalance,
    })
  }

  render() {
    const { amount, recipientBalance, hubBalance } = this.state
    const bal = new BN(this.props.balance)
    const amt = new BN(toWei(amount))
    const zero = new BN(0)
    const disabled = !(bal.gte(amt) && amt.gt(zero) && this.props.contractStatus === 'ready')

    return (
      <UI.Container>
        <UI.Header>
          Deploy
        </UI.Header>
        <UI.Form onSubmit={event => {
          event.preventDefault()
          this.deploy()
        }}>
          <UI.Field>
            <UI.Label>Charlie's balance</UI.Label>
            {toEth(recipientBalance)}
          </UI.Field>
          <UI.Field>
            <UI.Label>Hub's balance</UI.Label>
            {toEth(hubBalance)}
          </UI.Field>
          <UI.Actions>
            <UI.Button type="submit" disabled={disabled}>
              Send 1 ETH to charlie
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
    contractStatus: state.contractStatus,
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    deployContract: (userId) => dispatch(deployContract(userId)),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(App)
