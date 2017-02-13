import React from 'react';
import { connect } from 'react-redux';
import { setEditorState } from './actions';
import { Editor } from 'draft-js';
import logo from './logo.svg';
import './App.css';

let App = ({ version, rhymes, onUserType }) => (
  <div className="App">
    <div className="App-header">
      <img src={logo} className="App-logo" alt="logo" />
      <h2>Welcome to React</h2>
    </div>
    <p className="App-intro">
      Server version: {version.version}.
      <Editor
        editorState={rhymes.editor}
        onChange={onUserType}
      /> 
    </p>
    <p>
      {rhymes.currentWord}
      <ul>
        {rhymes.currentWordMatches.map((word) => <li>{word}</li>)} 
      </ul>
    </p>
  </div>
);

App = connect(
  (state) => ({ version: state.version, rhymes: state.rhymes }),
  (dispatch) => ({
    onUserType: (editor) => dispatch(setEditorState(editor)),
  })
)(App);

export default App;