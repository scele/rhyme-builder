// @flow

import { zipObject } from 'lodash/fp';
import type { Dispatch, Word, RhymingWord } from '../types';


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

export const loadVersion = () => (dispatch: Dispatch) => {
  fetch('/api/version', { headers: { 'Accept': 'application/json' } })
    .then(checkStatus)
    .then(parseJSON)
    .then(response => {
      console.log(response);
      return dispatch({
        type: 'LOAD_VERSION_SUCCESS',
        response
      });
    });
};

const fetchJson = (path) =>
  fetch(path, { headers: { 'Accept': 'application/json' } })
    .then(checkStatus)
    .then(parseJSON);

export const setEditorState = (editorState: Object) => (dispatch: Dispatch) =>
  dispatch({
    type: 'SET_EDITOR_STATE',
    editorState: editorState,
  });

export const selectWord = (word: Word) => (dispatch: Dispatch) =>
  dispatch({
    type: 'SELECT_WORD',
    word: word,
  });

export const selectRhyme = (word: RhymingWord) => (dispatch: Dispatch) =>
  dispatch({
    type: 'SELECT_RHYME',
    word: word,
  });

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
    })
  );
};