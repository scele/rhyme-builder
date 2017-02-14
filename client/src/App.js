import React from 'react';
import { connect } from 'react-redux';
import { setEditorState, selectWord, selectRhyme } from './actions';
import { Editor } from 'draft-js';
import logo from './logo.svg';
import './App.css';
import { Table, TableBody, TableRow, TableRowColumn } from 'material-ui/Table';
import Flex from 'jsxstyle/Flex';

let App = ({ version, rhymes, onUserType, onWordSelected, onRhymeSelected }) => (
  <div className="App">
    <div className="App-header">
      <img src={logo} className="App-logo" alt="logo" />
      <h2>Welcome to React</h2>
    </div>
    <p className="App-intro">
      Server version: {version.version}.
    </p>
      <Editor
        editorState={rhymes.editor}
        onChange={onUserType}
      /> 
      <Flex justifyContent="flex-start">
        <Table>
          <TableBody displayRowCheckbox={false} deselectOnClickaway={false}>
            {rhymes.currentWordInstances.map((word, i) => ( 
              <TableRow key={rhymes.selectedWord + ' ' + i}>
                <TableRowColumn>{word.actor}</TableRowColumn>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Table onRowSelection={(x) => onWordSelected(rhymes.currentWords[x[0]])}>
          <TableBody displayRowCheckbox={false} deselectOnClickaway={false}>
            {rhymes.currentWords.map((word) => ( 
              <TableRow key={word}>
                <TableRowColumn>{word}</TableRowColumn>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Table onRowSelection={(x) => onRhymeSelected(rhymes.currentRhymes[x[0]].word)}>
          <TableBody displayRowCheckbox={false} deselectOnClickaway={false}>
            {rhymes.currentRhymes.map((rhyme, i) => ( 
              <TableRow key={rhymes.selectedWord + ' ' + i}>
                <TableRowColumn>{rhyme.word}</TableRowColumn>
                <TableRowColumn>{rhyme.numInstances}</TableRowColumn>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Table>
          <TableBody displayRowCheckbox={false} deselectOnClickaway={false}>
            {rhymes.currentRhymeInstances.map((word, i) => ( 
              <TableRow key={rhymes.selectedRhyme + ' ' + i}>
                <TableRowColumn>{word.actor}</TableRowColumn>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Flex>
  </div>
);

App = connect(
  (state) => ({ version: state.version, rhymes: state.rhymes }),
  (dispatch) => ({
    onUserType: (editor) => dispatch(setEditorState(editor)),
    onWordSelected: (word) => dispatch(selectWord(word)),
    onRhymeSelected: (word) => dispatch(selectRhyme(word)),
  })
)(App);

export default App;