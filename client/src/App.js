// @flow

import React from 'react';
import { connect } from 'react-redux';
import { setEditorState, selectWord, selectRhyme } from './actions';
import { Editor } from 'draft-js';
import logo from './logo.svg';
import './App.css';
import { Flex, Block, Table, TableRow, TableCell } from 'jsxstyle';
import type { State, Action, Dispatch } from './types';

type AppStateProps = {
  rhymes: State,
  version: { version: string },
};

type AppDispatchProps = {
  onUserType: string => Action,
  onWordSelected: string => Action,
  onRhymeSelected: string => Action,
};

type AppProps = AppStateProps & AppDispatchProps;

const Cell = ({children, onClick}) => (
  <td
    onClick={onClick}
    style={{
      paddingLeft: 24,
      paddingRight: 24,
      height: 48,
      textAlign: "left",
      fontSize: 13}}>
    {children}
  </td>
);

const Row = ({children, selected, onClick}) => {
  const rowColumns = React.Children.map(children, (child, columnNumber) => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child, {
          onClick: onClick,
        });
      }
    });
  return (
    <tr style={{backgroundColor: selected ? "rgb(224, 224, 224)" : "white"}}>
      {rowColumns}
    </tr>
  );
};

const Pane = ({children}) => (
  <Block flexGrow={1} width="100px">
    <Table borderCollapse="collapse" width="100%" component="table">
      <tbody>
        {children}
      </tbody>
    </Table>
  </Block>
);

let App = ({ version, rhymes, onUserType, onWordSelected, onRhymeSelected }: AppProps) => (
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
        <Pane>
          {rhymes.currentWordInstances.map((word, i) => (
            <Row key={[rhymes.selectedWord, i]}>
              <Cell>{word.actor} ({word.time})</Cell>
            </Row>
          ))}
        </Pane>
        <Pane>
          {rhymes.currentWords.map((word, i) => (
            <Row
                onClick={() => onWordSelected(word)}
                key={word}
                selected={rhymes.selectedWord === word}>
              <Cell>{word}</Cell>
            </Row>
          ))}
        </Pane>
        <Pane>
          {rhymes.currentRhymes.map((rhyme, i) => (
            <Row
                onClick={() => onRhymeSelected(rhyme.word)}
                key={[rhymes.selectedWord, i]}
                selected={rhymes.selectedRhyme === rhyme.word}>
              <Cell>{rhyme.word}</Cell>
              <Cell>{rhyme.numInstances}</Cell>
            </Row>
          ))}
        </Pane>
        <Pane>
          {rhymes.currentRhymeInstances.map((word, i) => (
            <Row key={[rhymes.selectedRhyme, i]}>
              <Cell>{word.actor} ({word.time})</Cell>
            </Row>
          ))}
        </Pane>
      </Flex>
  </div>
);

App = connect(
  (state): AppStateProps => ({ version: state.version, rhymes: state.rhymes }),
  (dispatch: Dispatch): AppDispatchProps => ({
    onUserType: (editor) => dispatch(setEditorState(editor)),
    onWordSelected: (word) => dispatch(selectWord(word)),
    onRhymeSelected: (word) => dispatch(selectRhyme(word)),
  })
)(App);

export default App;