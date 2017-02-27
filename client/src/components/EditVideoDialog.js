// @flow

import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import { Editor, EditorState, ContentState } from 'draft-js';
import type { Video } from '../types';

type EditVideoDialogProps = {
  onClose: ?$Shape<Video> => any,
  currentTime: ?number,
  video: Video,
  open: boolean,
};

export default class EditVideoDialog extends React.Component {
  state: { currentTime: ?number, editorState: Object };
  props: EditVideoDialogProps;

  constructor(props: EditVideoDialogProps) {
    super(props);
    this.state = {
      currentTime: props.currentTime || 0,
      editorState: EditorState.createWithContent(ContentState.createFromText(props.video.text)),
    };
  }

  onTextChange(editorState: Object) {
    this.setState({ editorState: editorState });
  }

  onClose(save: boolean) {
    this.props.onClose(
      save ? {
        ...this.props.video,
        text: this.state.editorState.getCurrentContent().getPlainText(),
      } : null);
  }

  render() {
    const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onTouchTap={x => this.onClose(false)}
      />,
      <FlatButton
        label="Save"
        primary={true}
        keyboardFocused={true}
        onTouchTap={x => this.onClose(true)}
      />,
    ];

    return (
      <div>
        <Dialog
          title="Edit subtitles"
          actions={actions}
          modal={false}
          open={this.props.open}
          onRequestClose={x => this.onClose(false)}
          autoScrollBodyContent={true}
        >
          <video preload="metadata" style={{width:'640px'}} controls="controls">
            <source src={this.props.video.lores} type='video/mp4'/>
          </video>
          <Editor editorState={this.state.editorState} onChange={this.onTextChange} />
        </Dialog>
      </div>
    );
  }
}