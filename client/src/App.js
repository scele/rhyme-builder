import React from 'react';
import { connect } from 'react-redux';
import logo from './logo.svg';
import './App.css';

let App = ({ version }) => (
  <div className="App">
    <div className="App-header">
      <img src={logo} className="App-logo" alt="logo" />
      <h2>Welcome to React</h2>
    </div>
    <p className="App-intro">
      Server version: {version.version}.
    </p>
  </div>
);

App = connect(
  (state) => ({ version: state.version })
)(App);

export default App;