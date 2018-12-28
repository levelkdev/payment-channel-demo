import React, { Component } from 'react';
import styled from 'styled-components'
import { connect } from 'react-redux'
import { resetPassword } from './actions'

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
  `,
  Button: styled.button`
    cursor: pointer;
  `
}

class App extends Component {
  constructor() {
    super()
    this.state = {
      password: '',
      passwordConfirm: '',
      token: ''
    }
  }

  componentDidMount() {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('access_token')
    this.setState({
      token
    })
  }

  async resetPassword() {
    const { password, passwordConfirm, token } = this.state

    await this.props.resetPassword(password, passwordConfirm, token)

    this.setState({
      password: '',
      passwordConfirm: '',
    })
  }

  render() {
    const { password, passwordConfirm } = this.state

    return (
      <UI.Container>
        <UI.Header>
          Reset password
        </UI.Header>
        <UI.Form onSubmit={event => {
          event.preventDefault()
          this.resetPassword()
        }}>
          <UI.Field>
            <UI.Label>New password</UI.Label>
            <UI.Input type="password" value={password} onChange={event => this.setState({password: event.target.value})} />
          </UI.Field>
          <UI.Field>
            <UI.Label>Confirm New password</UI.Label>
            <UI.Input type="password" value={passwordConfirm} onChange={event => this.setState({passwordConfirm: event.target.value})} />
          </UI.Field>
          <UI.Actions>
            <UI.Button type="submit">
              Set password
            </UI.Button>
          </UI.Actions>
        </UI.Form>
      </UI.Container>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {

  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    resetPassword: (password, passwordConfirm, token) => dispatch(resetPassword(password, passwordConfirm, token)),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(App)
