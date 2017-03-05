// @flow

import type { Video } from '../types';
import type { Store as ReduxStore, Dispatch as ReduxDispatch } from 'redux';
import { saveVideo } from '../actions';

export const SET_EDITOR_STATE   = 'VIDEO_INSPECTOR:SET_EDITOR_STATE';
export const OPEN               = 'VIDEO_INSPECTOR:OPEN';
export const CLOSE              = 'VIDEO_INSPECTOR:CLOSE';
export const SAVE               = 'VIDEO_INSPECTOR:SAVE';

export type Action =
    { type: 'VIDEO_INSPECTOR:SET_EDITOR_STATE', editorState: Object }
  | { type: 'VIDEO_INSPECTOR:OPEN', video: Video }
  | { type: 'VIDEO_INSPECTOR:CLOSE' }
  | { type: 'VIDEO_INSPECTOR:SAVE' }
  ;

export type State = {
  video: Video,
  editorState: Object, // TODO
  open: boolean,
};

export type Store = ReduxStore<State, Action>;
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

export const save = (video: Video) => (dispatch: Dispatch) => {
  return saveVideo(video)(dispatch);
};

export const setEditorState = (editorState: Object) => (dispatch: Dispatch) => {
  return dispatch({
    type: SET_EDITOR_STATE,
    editorState: editorState,
  });
};