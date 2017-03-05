// @flow

import React from 'react';
import { connect } from 'react-redux';
import { Block, InlineBlock } from 'jsxstyle';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import { Editor, EditorState, ContentState } from 'draft-js';

import type { Dispatch, State } from '../actions/videoInspector';
import type { Video } from '../types';
import  { close, save, setEditorState } from '../actions/videoInspector';

type Props = StateProps & DispatchProps;
type StateProps = {
  state: State,
};
type DispatchProps = {
  onEditorStateChange: Function,
  onClose: ?Video => any,
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
          <Editor editorState={state.editorState} onChange={onEditorStateChange} />
        </InlineBlock>
      </Dialog>
    </div>
  ) : null;
}

VideoInspectorDialog = connect(
  (state) => ({ state: state.videoInspector }),
  (dispatch: Dispatch): DispatchProps => ({
    onClose: video => {
      if (video) {
        save(video)(dispatch);
      }
      close()(dispatch);
    },
    onEditorStateChange: (editorState) => setEditorState(editorState)(dispatch),
  })
)(VideoInspectorDialog);

export default VideoInspectorDialog;