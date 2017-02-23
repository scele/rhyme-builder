// @flow

import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { setEditorState, selectWord, selectRhyme } from './actions';
import { Card, CardMedia, CardText, CardHeader } from 'material-ui/Card';
import Avatar from 'material-ui/Avatar';
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

const FlexPane = ({children, size = 1, justifyContent='flex-start'}) => (
  <Block flexGrow={size} width="100px">
    <Flex flexWrap="wrap" textAlign="left" justifyContent={justifyContent}>
      {children}
    </Flex>
  </Block>
);

class Video extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      paused: true,
    };
  }
  componentDidMount() {
    this.videoElement.currentTime = this.props.currentTime;
  }
  componentDidUpdate() {
    this.videoElement.currentTime = this.props.currentTime;
  }
  onClick() {
    this.setState({ paused: !this.videoElement.paused });
    this.videoElement.paused ? this.videoElement.play() : this.videoElement.pause();
  }
  render() {
    return (
      <Block position="relative" cursor="pointer">
        <video preload="metadata" style={{width:300}}
              onClick={this.onClick.bind(this)} ref={c => this.videoElement = c}>
          <source src={this.props.src} type='video/mp4'/>
        </video>
        { this.state.paused
          ? <input type="image" src="/play.png" style={{position: 'absolute', left: '50%', top: '50%', margin: '-36px', pointerEvents: 'none'}} />
          : null }
      </Block>
    );
  }
}

const VideoCard = ({ word }) => (
  <Card style={{marginLeft: 10, marginRight: 10, marginBottom: 20}}>
    <CardHeader avatar={<Avatar>J</Avatar>} title={word.actor} subtitle={word.video.title} />
    <CardMedia>
      <Video src={word.video.video} currentTime={word.seconds} />
    </CardMedia>
    <CardText>
      Lorem ipsum dolor sit amet, consectetur
    </CardText>
  </Card>
);

let App = ({ version, rhymes, onUserType, onWordSelected, onRhymeSelected, onVideoError }: AppProps) => (
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
        <FlexPane size={2} justifyContent="flex-end">
          {rhymes.currentWordInstances.map((word, i) => (
            <VideoCard key={[rhymes.selectedWord, i]} word={word} />
          ))}
        </FlexPane>
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
        <FlexPane size={2}>
          {rhymes.currentRhymeInstances.map((word, i) => (
            <VideoCard key={[rhymes.selectedRhyme, i]} word={word} />
          ))}
        </FlexPane>
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