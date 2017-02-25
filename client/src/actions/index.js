// @flow

import { zipObject } from 'lodash/fp';
import type { Dispatch } from '../types';
import { EditorState, convertFromRaw, convertToRaw } from 'draft-js';

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    const error = new Error(`HTTP Error ${response.statusText}`);
    //error.status = response.statusText;
    //error.response = response;
    console.log(error); // eslint-disable-line no-console
    throw error;
  }
}

function parseJSON(response) {
  console.log(response);
  return response.json();
}

const fetchJson = (path) =>
  fetch(path, { headers: { 'Accept': 'application/json' } })
    .then(checkStatus)
    .then(parseJSON);

export const setEditorState = (editorState: Object) => (dispatch: Dispatch) => {
  localStorage.setItem('editorState', JSON.stringify(convertToRaw(editorState.getCurrentContent())));
  return dispatch({
    type: 'SET_EDITOR_STATE',
    editorState: editorState,
  });
};

export const selectWord = (word: string) => (dispatch: Dispatch) => {
  localStorage.setItem('selectedWord', word);
  return dispatch({
    type: 'SELECT_WORD',
    word: word,
  });
};

export const selectRhyme = (word: string) => (dispatch: Dispatch) => {
  localStorage.setItem('selectedRhyme', word);
  return dispatch({
    type: 'SELECT_RHYME',
    word: word,
  });
};

function flowMaybe(...funcs) {
  const length = funcs ? funcs.length : 0;
  return function(...args) {
    let index = 0;
    let result: any = length ? funcs[index].apply(this, args) : args[0];
    while (++index < length && result !== null && result !== undefined) {
      result = funcs[index].call(this, result);
    }
    return result;
  }
}

const load = (key: string) => localStorage.getItem(key);
const loadEditorState = flowMaybe(load, JSON.parse, convertFromRaw, EditorState.createWithContent);

const loadState = () => (dispatch: Dispatch) => {
  try {
    flowMaybe(loadEditorState, setEditorState, dispatch)('editorState');
    flowMaybe(load, selectWord, dispatch)('selectedWord');
    flowMaybe(load, selectRhyme, dispatch)('selectedRhyme');
  } catch(err) {
    console.log("Loading state from local storage failed");
  }
};

export const loadData = () => (dispatch: Dispatch) => {
  Promise.all([
    fetchJson('/api/words'),
    fetchJson('/api/rhymes'),
    fetchJson('/api/videos')
  ])
  .then(zipObject(['words', 'rhymes', 'videos']))
  .then(response =>
    dispatch({
      type: 'LOAD_DATA_SUCCESS',
      words: response.words,
      rhymes: response.rhymes,
      videos: response.videos,
    }))
  .then(() =>
    loadState()(dispatch));
};