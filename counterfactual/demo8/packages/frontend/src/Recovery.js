import React, { Component } from 'react';
import styled from 'styled-components'
import { connect } from 'react-redux'
import {
  setRecoveryAddress,
  removeRecoveryAddress,
} from './actions'
import {
  getConnectedAccount,
} from './utils'

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
      recoveryAddress: '',
    }
  }

  componentDidMount() {
    this.loadRecoverAddress()
    this.i = setInterval(() => {
      this.loadRecoverAddress()
    }, 1e3)
  }

  async loadRecoverAddress() {
    const recoveryAddress = await getConnectedAccount()
    if (recoveryAddress) {
      window.clearInterval(this.i)
      this.setState({
        recoveryAddress
      })
    }
  }

  async addRecoveryAddress() {
    const { recoveryAddress } = this.state
    await this.props.setRecoveryAddress(recoveryAddress)
  }

  async removeRecoveryAddress() {
    await this.props.removeRecoveryAddress()
  }

  render() {
    const { recoveryAddress } = this.state
    const disabled = !(this.props.contractStatus === 'active')

    return (
      <UI.Container>
        {this.props.userRecoveryAddress ?
        <div>
          <UI.Header>
            Remove recovery address
          </UI.Header>
          <UI.Form onSubmit={event => {
            event.preventDefault()
            this.removeRecoveryAddress()
          }}>
            <UI.Field>
              <UI.Label>Recovery address</UI.Label>
              {this.props.userRecoveryAddress}
            </UI.Field>
            <UI.Actions>
              <UI.Button
                type="submit">
                Remove recovery address
              </UI.Button>
            </UI.Actions>
          </UI.Form>
        </div>
        :
        <div>
          <UI.Header>
            Add recovery address
          </UI.Header>
          <UI.Form onSubmit={event => {
            event.preventDefault()
            this.addRecoveryAddress()
          }}>
            <UI.Field>
              <UI.Label>Recovery address</UI.Label>
              {!recoveryAddress ? `can't read address; is metamask opened?` : null}
              {recoveryAddress}
            </UI.Field>
            <UI.Actions>
              <UI.Button
                type="submit"
                disabled={disabled}>
                Add recovery address
              </UI.Button>
            </UI.Actions>
          </UI.Form>
        </div>
        }
      </UI.Container>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    userId: state.userId,
    contractStatus: state.contractStatus,
    userRecoveryAddress: state.recoveryAddress,
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    setRecoveryAddress: (address) => dispatch(setRecoveryAddress(address)),
    removeRecoveryAddress: () => dispatch(removeRecoveryAddress()),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(App)
