// @flow

import React from 'react';
import { connect } from 'react-redux';
import { setEditorState, selectWord, selectRhyme } from './actions';
// $FlowFixMe
import { Card, CardMedia, CardText, CardHeader } from 'material-ui/Card';
// $FlowFixMe
import Avatar from 'material-ui/Avatar';
// $FlowFixMe
import { List, ListItem, makeSelectable } from 'material-ui/List';
import { Editor } from 'draft-js';
import logo from './logo.svg';
import './App.css';
import { Flex, Block } from 'jsxstyle';
import { Video } from './components/Video';
import type { State, Action, Dispatch } from './types';
import injectTapEventPlugin from 'react-tap-event-plugin';

type AppStateProps = {
  rhymes: State,
  version: { version: string },
};

// Needed for onTouchTap
injectTapEventPlugin();

const SelectableList = makeSelectable(List);

type AppDispatchProps = {
  onUserType: Object => Action,
  onWordSelected: string => Action,
  onRhymeSelected: string => Action,
};

type AppProps = AppStateProps & AppDispatchProps;

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
      <h2>Rhyme Builder</h2>
    </div>
      <Block fontSize="150%" margin={30} border="solid 1px grey" padding={10}>
        <Editor
          editorState={rhymes.editor.state}
          onChange={onUserType}
        />
      </Block>
      <Flex justifyContent="flex-start">
        <VideoCardsPane word={rhymes.selectedWord} justifyContent="flex-end" />
        <SelectableList style={{width: 400}} value={rhymes.selectedWord}>
          {rhymes.currentWords.map((word, i) => (
            <ListItem
                onClick={() => onWordSelected(word.str)}
                key={word.str}
                value={word}
                selected={rhymes.selectedWord === word}
                primaryText={word.str}
                leftIcon={<div>{word.instances.length}</div>}
                rightIcon={<div>{word.rhymingWords.length}</div>} />
          ))}
        </SelectableList>
        <SelectableList style={{width: 400}} value={rhymes.selectedRhymingWord}>
          {rhymes.currentRhymingWords.map((word, i) => (
            <ListItem
                onClick={() => onRhymeSelected(word.str)}
                key={word.str}
                value={word}
                selected={rhymes.selectedRhymingWord === word}
                primaryText={word.str}
                leftIcon={<div></div>}
                rightIcon={<div>{word.instances.length}</div>} />
          ))}
        </SelectableList>
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