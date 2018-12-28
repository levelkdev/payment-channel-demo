import React, { Component } from 'react';
import styled from 'styled-components'

const UI = {
  Header: styled.div`
    font-size: 1em;
    font-weight: bold;
    max-width: 600px;
    margin: 0 auto;
    margin-bottom: 2em;
  `,
  Container: styled.div`
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
  `,
  Label: styled.div`
    display: block;
    margin-bottom: 0.5em;
    font-size: 0.8em;
    font-weight: bold;
    margin: 0 auto;
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

    }
  }

  render() {
    return (
      <UI.Container>
        <UI.Header>
          Sign in to get started
        </UI.Header>
      </UI.Container>
    );
  }
}

export default App;
