// @flow

import React from 'react';
import { connect } from 'react-redux';
import {  InlineBlock } from 'jsxstyle';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import { Editor } from 'draft-js';

// Actions
import { close, setEditorState } from './actions';
import { saveVideo } from '../actions';

// Types
import type { Dispatch } from './actions';
import type { State } from './reducer';
import type { Video } from '../types';

type StateProps = {
  state: State,
};
type DispatchProps = {
  onEditorStateChange: Function,
  onClose: ?Video => any,
};
type Props = StateProps & DispatchProps;

const editorStyleMap = {
  currentRhyme: {
    backgroundColor: 'rgba(0, 255, 255, 1.0)',
  },
};

let VideoInspectorDialog = ({ state, onClose, onEditorStateChange }: Props) => {
  const actions = [
    <FlatButton
      label="Cancel"
      primary={true}
      onTouchTap={x => onClose()}
    />,
    <FlatButton
      label="Save"
      primary={true}
      keyboardFocused={true}
      onTouchTap={x => onClose(state.video)}
    />,
  ];
  return state.video ? (
    <div>
      <Dialog
        title="Edit subtitles"
        actions={actions}
        modal={false}
        open={state.open}
        onRequestClose={x => onClose()}
        autoScrollBodyContent={true}
        contentStyle={{width: 1400, maxWidth: 'none'}}
      >
        <video preload="metadata" style={{width: 640, position: 'fixed'}} controls="controls">
          <source src={state.video.lores} type='video/mp4'/>
        </video>
        <InlineBlock marginLeft={640} width={640} height={360} padding={20}>
          <Editor editorState={state.editorState} onChange={onEditorStateChange} customStyleMap={editorStyleMap} />
        </InlineBlock>
      </Dialog>
    </div>
  ) : null;
}

VideoInspectorDialog = connect(
  (state): StateProps => ({ state: state.videoInspector }),
  (dispatch: Dispatch): DispatchProps => ({
    onClose: video => {
      if (video) {
        saveVideo(video)(dispatch);
      }
      close()(dispatch);
    },
    onEditorStateChange: (editorState) => setEditorState(editorState)(dispatch),
  })
)(VideoInspectorDialog);

export default VideoInspectorDialog;