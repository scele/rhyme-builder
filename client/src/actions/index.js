import { zipObject } from 'lodash/fp';

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    const error = new Error(`HTTP Error ${response.statusText}`);
    error.status = response.statusText;
    error.response = response;
    console.log(error); // eslint-disable-line no-console
    throw error;
  }
}

function parseJSON(response) {
  console.log(response);
  return response.json();
}

export const loadVersion = () => (dispatch) => {
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

export const setEditorState = (editorState) => (dispatch) =>
  dispatch({
    type: 'SET_EDITOR_STATE',
    editorState: editorState,
  });

export const selectWord = (word) => (dispatch) =>
  dispatch({
    type: 'SELECT_WORD',
    word: word,
  });

export const selectRhyme = (word) => (dispatch) =>
  dispatch({
    type: 'SELECT_RHYME',
    word: word,
  });

export const loadData = () => (dispatch) => {
  Promise.all([
    fetchJson('/api/words'),
    fetchJson('/api/rhymes')
  ]).then(zipObject(['words', 'rhymes']))
   .then(reponse => dispatch({
        type: 'LOAD_DATA_SUCCESS',
        ...reponse,
      })
   );
   /*
    .then(checkStatus)
    .then(parseJSON)
    .then(response => {
      console.log(response);
      return Promise.all(
        response.raw.map((path) => {
          return fetchJson(path)
                  .then(checkStatus)
                  .then((response) => { return response.text(); })
        })
      );
    })
    .then(response => {
      console.log(response);
      return dispatch({
        type: 'LOAD_DATA_SUCCESS',
        response
      });
    });*/
};