// @flow

import type { Video } from '../types';
import type { Dispatch as ReduxDispatch } from 'redux';

export const SET_EDITOR_STATE   = 'VIDEO_INSPECTOR:SET_EDITOR_STATE';
export const OPEN               = 'VIDEO_INSPECTOR:OPEN';
export const CLOSE              = 'VIDEO_INSPECTOR:CLOSE';
export const HIGHLIGHT_TEXT_AT  = 'VIDEO_INSPECTOR:HIGHLIGHT_TEXT_AT';

export type Action =
    { type: 'VIDEO_INSPECTOR:SET_EDITOR_STATE', editorState: Object }
  | { type: 'VIDEO_INSPECTOR:OPEN', video: Video }
  | { type: 'VIDEO_INSPECTOR:CLOSE' }
  | { type: 'VIDEO_INSPECTOR:HIGHLIGHT_TEXT_AT', time: number }
  ;

export type Dispatch = ReduxDispatch<Action>;

export const open = (video: Video) => (dispatch: Dispatch) => {
  return dispatch({
    type: OPEN,
    video: video,
  });
};

export const close = () => (dispatch: Dispatch) => {
  return dispatch({
    type: CLOSE,
  });
};

export const setEditorState = (editorState: Object) => (dispatch: Dispatch) => {
  return dispatch({
    type: SET_EDITOR_STATE,
    editorState: editorState,
  });
};

export const highlightTextAt = (time: number) => (dispatch: Dispatch) => {
  return dispatch({
    type: HIGHLIGHT_TEXT_AT,
    time: time,
  })
}