// @flow

import React from 'react';
import { connect } from 'react-redux';
import { Flex, Block, InlineBlock } from 'jsxstyle';
import { Video } from '../components/Video';
import type { State, Action, Dispatch } from '../types';
// $FlowFixMe
import Paper from 'material-ui/Paper';
// $FlowFixMe
import FlatButton from 'material-ui/FlatButton';
// $FlowFixMe
import { Card, CardMedia, CardText, CardHeader } from 'material-ui/Card';
// $FlowFixMe
import TextField from 'material-ui/TextField';
import Avatar from 'material-ui/Avatar';
import Chip from 'material-ui/Chip';
import AutoComplete from 'material-ui/AutoComplete';
import { saveVideo } from '../actions';
import EditVideoDialog from './EditVideoDialog';

type VideoListStateProps = {
  state: State,
};

type VideoListDispatchProps = {
  onVideoModified: Video => any,
};

type VideoListProps = VideoListStateProps & VideoListDispatchProps;

const overflowStyle = {overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'};



class EditVideoCard extends React.Component {
  constructor(props: EditVideoDialogProps) {
    super(props);
    this.state = {
      dialogOpen: false,
    };
  }

  handleOpen = () => {
    this.setState({dialogOpen: true});
  };
  handleClose = (modifiedVideo = null) => {
    this.setState({dialogOpen: false});
    if (modifiedVideo) {
      this.props.onVideoModified(modifiedVideo);
    }
  };

  handleTitleBlur = (event) => {
    this.props.onVideoModified({
      ...this.props.video,
      title: event.target.value,
    });
  };
  render() {
    const video = this.props.video;
    return (
      <Block style={{width: 920, margin: '0 auto'}}>
        <Paper style={{height: 180, marginTop: 20, textAlign: 'left'}} zDepth={1} rounded={false}>
          <Video src={video.lores} width={320} />
          <InlineBlock style={{width: 560, verticalAlign: 'top', padding: 20}}>
            <FlatButton label="Subtitles" style={{float: 'right'}} onTouchTap={this.handleOpen} />
            <TextField name="title" floatingLabelText="Title"
                       onBlur={this.handleTitleBlur} defaultValue={video.title} />
            <Block marginTop={20}>
              {video.speakers.map(speaker => 
                <Chip key={speaker}>
                <Avatar>{speaker[0].toUpperCase()}</Avatar>
                {speaker}
                </Chip>
              )}
            </Block>
          </InlineBlock>
        </Paper>
        <EditVideoDialog onClose={this.handleClose} video={video} open={this.state.dialogOpen} />
      </Block>
    );
  }
};


const VideoCard = ({ video, onVideoModified }) => (
  <Block style={{width: 920, margin: '0 auto'}}>
    <Paper style={{height: 180, marginTop: 20, textAlign: 'left'}} zDepth={1} rounded={false}>
      <Video src={video.lores} width={320} />
      <InlineBlock style={{width: 560, verticalAlign: 'top', padding: 20}}>
        <FlatButton label="Subtitles" style={{float: 'right'}} />
        <TextField name="title" floatingLabelText="Title" onChange={(event, newValue) => onVideoModified({...video, title: newValue})} />
        <Block marginTop={20}>
          {video.speakers.map(speaker => 
            <Chip key={speaker}>
            <Avatar>{speaker[0].toUpperCase()}</Avatar>
            {speaker}
            </Chip>
          )}
        </Block>
      </InlineBlock>
    </Paper>
    <EditVideoDialog onClose={(save) => console.log('close')} video={video} open={false} />
  </Block>
);

let VideoList = ({ state, onVideoModified }: VideoListProps) => (
  <div className="App">
    <div className="App-header">
      <h2>Rhyme Builder</h2>
    </div>
    <Block>
      {state.filteredVideos.map(video =>
        <EditVideoCard video={video} key={video.video} onVideoModified={onVideoModified} />
      )}
    </Block>
  </div>
);

VideoList = connect(
  (state): VideoListStateProps => ({ state: state.rhymes }),
  (dispatch: Dispatch): VideoListDispatchProps => ({
    onVideoModified: video => saveVideo(video)(dispatch),
  })
)(VideoList);

export default VideoList;