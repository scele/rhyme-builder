// @flow

import React from 'react';
import { connect } from 'react-redux';
import { setEditorState, selectWord, selectRhyme } from './actions';
// $FlowFixMe
import { Card, CardMedia, CardText, CardHeader } from 'material-ui/Card';
// $FlowFixMe
import Avatar from 'material-ui/Avatar';
import { Editor } from 'draft-js';
import logo from './logo.svg';
import './App.css';
import { Flex, Block, Table } from 'jsxstyle';
import { Video } from './components/Video';
import type { State, Action, Dispatch } from './types';

type AppStateProps = {
  rhymes: State,
  version: { version: string },
};

type AppDispatchProps = {
  onUserType: Object => Action,
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

const Pane = ({children, size = 1}) => (
  <Block flexGrow={size} width="100px">
    <Table borderCollapse="collapse" width="100%" component="table">
      <tbody>
        {children}
      </tbody>
    </Table>
  </Block>
);

const VideoCard = ({ word }) => (
  <Card style={{marginLeft: 10, marginRight: 10, marginBottom: 20}}>
    <CardHeader avatar={<Avatar>J</Avatar>} title={word.actor} subtitle={word.video.title} />
    <CardMedia>
      <Video src={word.video.video} currentTime={word.seconds} />
    </CardMedia>
    <CardText>
      <Block textOverflow="ellipsis" width="252px"
             whiteSpace="nowrap" overflow="hidden">
        {word.context}
      </Block>
    </CardText>
  </Card>
);

const VideoCardsPane = ({word, justifyContent='flex-start'}) =>
  <Block flexGrow={2} width="100px">
    <Flex flexWrap="wrap" textAlign="left" justifyContent={justifyContent}>
      {word ? word.instances.map((wordInstance, i) => // $FlowFixMe
        <VideoCard key={[word.str, i]} word={wordInstance} />
      ) : null}
    </Flex>
  </Block>;

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
        editorState={rhymes.editor.state}
        onChange={onUserType}
      /> 
      <Flex justifyContent="flex-start">
        <VideoCardsPane word={rhymes.selectedWord} justifyContent="flex-end" />
        <Pane>
          {rhymes.currentWords.map((word, i) => (
            <Row
                onClick={() => onWordSelected(word.str)}
                key={word.str}
                selected={rhymes.selectedWord === word}>
              <Cell>{word.instances.length}</Cell>
              <Cell>{word.str}</Cell>
              <Cell>{word.rhymingWords.length}</Cell>
            </Row>
          ))}
        </Pane>
        <Pane>
          {rhymes.currentRhymingWords.map((word, i) => (
            <Row
                onClick={() => onRhymeSelected(word.str)}
                key={word.str}
                selected={rhymes.selectedRhymingWord === word}>
              <Cell>{word.str}</Cell>
              <Cell>{word.instances.length}</Cell>
            </Row>
          ))}
        </Pane>
        <VideoCardsPane word={rhymes.selectedRhymingWord} />
      </Flex>
  </div>
);

App = connect(
  (state): AppStateProps => ({ version: state.version, rhymes: state.rhymes }),
  (dispatch: Dispatch): AppDispatchProps => ({
    onUserType: (editor) => setEditorState(editor)(dispatch),
    onWordSelected: (word) => selectWord(word)(dispatch),
    onRhymeSelected: (word) => selectRhyme(word)(dispatch),
  })
)(App);

export default App;