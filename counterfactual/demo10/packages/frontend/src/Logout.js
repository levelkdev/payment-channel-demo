import React, { Component } from 'react';
import styled from 'styled-components'
import { connect } from 'react-redux'
import { logout } from './actions'

const UI = {
  Container: styled.div`

  `,
}

class App extends Component {
  async componentDidMount() {
    await this.props.logout()
    this.props.history.push('/login')
  }

  render() {
    return (
      <UI.Container>
      </UI.Container>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return { }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    logout: () => dispatch(logout()),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(App)
