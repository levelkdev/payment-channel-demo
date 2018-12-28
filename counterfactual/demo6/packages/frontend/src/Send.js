import React, { Component } from 'react';
import styled from 'styled-components'
import { connect } from 'react-redux'
import { sendEther } from './actions'
import {
  toWei,
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
      amount: '',
    }
  }

  async send() {
    const { amount, recipient } = this.state
    const weiAmount = toWei(amount)
    await this.props.sendEther(recipient, weiAmount)
    this.setState({
      amount: ''
    })
  }

  render() {
    const { amount, recipient } = this.state
    const bal = new BN(this.props.balance)
    const amt = new BN(toWei(amount))
    const zero = new BN(0)
    const disabled = !(bal.gte(amt) && amt.gt(zero))

    return (
      <UI.Container>
        <UI.Header>
          Send
        </UI.Header>
        <UI.Form onSubmit={event => {
          event.preventDefault()
          this.send()
        }}>
          <UI.Field>
            <UI.Label>Recipient (address)</UI.Label>
            <UI.Input value={recipient} onChange={event => this.setState({recipient: event.target.value})} />
          </UI.Field>
          <UI.Field>
            <UI.Label>Amount (ETH)</UI.Label>
            <UI.Input value={amount} onChange={event => this.setState({amount: event.target.value})} />
          </UI.Field>
          <UI.Actions>
            <UI.Button type="submit" disabled={disabled}>
              Send
            </UI.Button>
          </UI.Actions>
          <UI.Notice>{disabled ? 'you do not have enough to send' : null}</UI.Notice>
        </UI.Form>
      </UI.Container>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    balance: state.balance
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    sendEther: (amount) => dispatch(sendEther(amount)),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(App)
