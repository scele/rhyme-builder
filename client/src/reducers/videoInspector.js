// @flow

import { EditorState, ContentState } from 'draft-js';
import { flow, keys, values, filter, map, flatten, mapValues, find, orderBy, uniqBy, take, zipObject } from 'lodash/fp';
import type { State, Action } from '../actions/videoInspector';
import { OPEN, CLOSE, SET_EDITOR_STATE } from '../actions/videoInspector';

// $FlowFixMe
const initialState: State = {
  open: false,
};

export default function videoInspector(state: State = initialState, action: Action): State {
  switch (action.type) {
    case OPEN:
      return {
        open: true,
        video: action.video,
        editorState: EditorState.createWithContent(ContentState.createFromText(action.video.text)),
      };
    case CLOSE:
      return {
        ...state,
        open: false,
      };
    case SET_EDITOR_STATE:
      return {
        ...state,
        video: {
          ...state.video,
          text: action.editorState.getCurrentContent().getPlainText(),
        },
        editorState: action.editorState,
      };
    default:
      return state;
  }
}