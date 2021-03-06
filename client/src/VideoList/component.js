// @flow

import React from 'react';
import { connect } from 'react-redux';
import { Flex, Block, InlineBlock } from 'jsxstyle';
import { Video as VideoComponent } from '../components/Video';
import Paper from 'material-ui/Paper';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import Avatar from 'material-ui/Avatar';
import Chip from 'material-ui/Chip';
import { VideoInspector } from '../VideoInspector';

// Actions
import { open as openVideoInspector } from '../VideoInspector/actions';
import { setFilter } from './actions';
import { saveVideo } from '../actions';

// Types
import type { Dispatch as ReduxDispatch } from 'redux';
import type { State } from './types';
import type { Video } from '../types';

type VideoListStateProps = {
  state: State,
};

type VideoListDispatchProps = {
  onVideoModified: Video => any,
  openVideoInspector: Video => any,
  onFilterChange: string => any,
};

type VideoListProps = VideoListStateProps & VideoListDispatchProps;

type EditVideoCardProps = {
  video: Video,
  onVideoModified: Video => any,
  openVideoInspector: Function,
};

class EditVideoCard extends React.Component {
  props: EditVideoCardProps;

  handleTitleBlur = (event) => {
    this.props.onVideoModified({
      ...this.props.video,
      title: event.target.value,
    });
  };
  render() {
    const video: Video = this.props.video;
    return (
      <Block style={{width: 920, margin: '0 auto'}}>
        <Paper style={{height: 180, marginTop: 20, textAlign: 'left'}} zDepth={1} rounded={false}>
          <VideoComponent src={video.lores} width={320} currentTime={video.firstAnnotationTime} />
          <InlineBlock style={{width: 560, verticalAlign: 'top', padding: 20}}>
            <FlatButton label="Subtitles" style={{float: 'right'}} onTouchTap={this.props.openVideoInspector} />
            <TextField name="title" floatingLabelText="Title"
                       onBlur={this.handleTitleBlur} defaultValue={video.title} />
            <Flex marginTop={20}>
              {video.speakers.map(speaker => 
                <Chip key={speaker} style={{margin: 5}}>
                  <Avatar>{speaker[0].toUpperCase()}</Avatar>
                  {speaker}
                </Chip>
              )}
            </Flex>
          </InlineBlock>
        </Paper>
      </Block>
    );
  }
};

let VideoList = ({ state, onVideoModified, openVideoInspector, onFilterChange }: VideoListProps) => (
  <div className="App">
    <div className="App-header">
      <h2>Rhyme Builder</h2>
    </div>
    <Block>
      <TextField value={state.filter} onChange={e => onFilterChange(e.target.value)} hintText="Search videos" />
      {state.filteredVideos.map(video =>
        <EditVideoCard video={video} key={video.video} onVideoModified={onVideoModified} openVideoInspector={x => openVideoInspector(video)} />
      )}
    </Block>
    <VideoInspector />
  </div>
);

VideoList = connect(
  (state): VideoListStateProps => ({ state: state.videoList }),
  (dispatch: ReduxDispatch<any>): VideoListDispatchProps => ({
    onVideoModified: video => saveVideo(video)(dispatch),
    openVideoInspector: video => openVideoInspector(video)(dispatch),
    onFilterChange: filter => setFilter(filter)(dispatch),
  })
)(VideoList);

export default VideoList;