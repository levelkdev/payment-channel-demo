import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import { connect } from 'react-redux'
import styled from 'styled-components'
import Home from './Home'
import Channel from './Channel'
import CloseChannel from './CloseChannel'
import Status from './Status'
import Login from './Login'
import Signup from './Signup'
import ForgotPassword from './ForgotPassword'
import ResetPassword from './ResetPassword'
import Logout from './Logout'
import Send from './Send'
import Deploy from './Deploy'
import { refreshUser } from './actions'

import {
  toEth
} from './utils'

const UI = {
  Container: styled.div`
    width: 100%;
  `,
  Header: styled.div`
    width: 100%;
    margin: 0 auto 3em auto;
    background: #f5f5f5;
  `,
  HeaderInner: styled.div`
    max-width: 800px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    padding: 1em;
  `,
  Nav: styled.nav`
    display: flex;
    vertical-align: middle;
    justify-content: center;
    > a {
      margin-left: 1em;
      color: #3489b5;
      text-decoration: none;
      border: 1px solid #e0dede;
      padding: 0.2em 0.5em;
      border-radius: 1em;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      &:hover {
        text-decoration: none;
        border: 1px solid #cccbcb;
      }
    }
  `,
  Title: styled.div`
    margin-right: 1em;
    font-size: 1.2em;
  `,
  ErrorMessage: styled.div`
    text-align: center;
    padding: 1em;
    color: red;
  `,
  SuccessMessage: styled.div`
    text-align: center;
    padding: 1em;
    color: green;
  `,
}

class App extends Component {
  componentDidMount() {
    if (this.props.userId) {
      this.props.refreshUser(this.props.userId)
      setInterval(() => {
        if (this.props.loggedIn) {
          this.props.refreshUser(this.props.userId)
        }
      }, 3e3)
    }
  }

  render() {
    const {
      errorMessage,
      successMessage,
      loggedIn,
      contractAddress,
      contractStatus,
      balance,
      email,
      userId,
    } = this.props

    return (
      <Router>
        <UI.Container>
          <UI.Header>
            <UI.HeaderInner>
              <UI.Title>Demo</UI.Title>
              <UI.Nav>
                {loggedIn ?
                  [
                  <div>
                    <div>
                      email: {email}
                    </div>
                    <div>
                      user ID: {userId}
                    </div>
                    <div>
                      Address: {contractAddress}
                    </div>
                    <div>
                      Status: {contractStatus}
                    </div>
                    <div>
                      Balance: {toEth(balance)}
                    </div>
                    <div>
                      <div>
                        <Link to="/logout">Logout</Link>
                      </div>
                    </div>
                  </div>,
                  ]
                  :
                [
                <Link to="/login">Login</Link>,
                <Link to="/signup">Signup</Link>,
                <Link to="/forgot-password">Forgot Password</Link>,
                ]
                }
              </UI.Nav>
            </UI.HeaderInner>
          </UI.Header>
          {errorMessage ?
            <UI.ErrorMessage>
              {errorMessage}
            </UI.ErrorMessage>
          : null}
          {successMessage ?
            <UI.SuccessMessage>
              {successMessage}
            </UI.SuccessMessage>
          : null}
          <Route path="/" exact component={Home} />
          <Route path="/send" exact component={Send} />
          <Route path="/channel" exact component={Channel} />
          <Route path="/closechannel" exact component={CloseChannel} />
          <Route path="/status" exact component={Status} />
          <Route path="/login" exact component={Login} />
          <Route path="/signup" exact component={Signup} />
          <Route path="/forgot-password" exact component={ForgotPassword} />
          <Route path="/reset-password" exact component={ResetPassword} />
          <Route path="/logout" exact component={Logout} />
          <Route path="/deploy" exact component={Deploy} />
        </UI.Container>
      </Router>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    loggedIn: state.loggedIn,
    email: state.email,
    userId: state.userId,
    contractAddress: state.contractAddress,
    contractStatus: state.contractStatus,
    balance: state.balance,
    errorMessage: state.errorMessage,
    successMessage: state.successMessage
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    refreshUser: (userId) => dispatch(refreshUser(userId))
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(App);
