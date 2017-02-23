// @flow

import { EditorState, convertFromRaw, convertToRaw } from 'draft-js';
import { flow, keys, filter, includes, map, flatten, uniq, mapValues, find } from 'lodash/fp';
import type { State, Action } from '../types';

const loadState = (): $Shape<State> => {
  try {
    const persisted: $Shape<State> = JSON.parse(localStorage.getItem('state') || '');
    return {
      editor: {
        state: EditorState.createWithContent(convertFromRaw(persisted.editor.state)),
        currentWord: persisted.editor.currentWord,
      },
      selectedWord: persisted.selectedWord,
      selectedRhyme: persisted.selectedRhyme,
    };
  } catch(err) {
    return {
      editor: {
        state: EditorState.createEmpty(),
        currentWord: null,
      },
      selectedWord: undefined,
      selectedRhyme: undefined,
    };
  }
};

const saveState = (state: State) => {
  localStorage.setItem('state', JSON.stringify({
    editor: {
      state: convertToRaw(state.editor.state.getCurrentContent()),
      currentWord: state.editor.currentWord,
    },
    selectedWord: state.selectedWord,
    selectedRhyme: state.selectedRhyme,
  }));
};

const initialState: State = {
  ...loadState(),
  currentWords: [],
  currentWordInstances: [],
  currentRhymes: [],
  currentRhymeInstances: [],
  words: {},
  rhymes: [],
  videos: [],
  selectedWordInstance: undefined,
  selectedRhymeInstance: undefined,
};

const getMatchingWords = (search, words) =>
  flow(
    keys,
    filter((x) => x.includes(search))
  )(words);

const getStartingWords = (search, words) =>
  flow(
    keys,
    filter((x) => x.startsWith(search))
  )(words);

const getSelectedText = (editorState): string => {
  let selectionState = editorState.getSelection();
  let anchorKey = selectionState.getAnchorKey();
  let currentContent = editorState.getCurrentContent();
  let currentContentBlock = currentContent.getBlockForKey(anchorKey);
  let start = selectionState.getStartOffset();
  let end = selectionState.getEndOffset();
  return currentContentBlock.getText().slice(start, end);
};

const getEditorWord = (editorState): string => {
  let selectionState = editorState.getSelection();
  let anchorKey = selectionState.getAnchorKey();
  let currentContent = editorState.getCurrentContent();
  let currentContentBlock = currentContent.getBlockForKey(anchorKey);
  let start = selectionState.getStartOffset();
  let end = selectionState.getEndOffset();
  let text = currentContentBlock.getText();
  while (start > 0 && !/\s/.test(text[start - 1]))
    start--;
  while (end < text.length && !/\s/.test(text[end]))
    end++;
  return text.slice(start, end);
};

const computeState = (oldState: State, modification: $Shape<State>): State => {
  let state: State = {
    ...oldState,
    ...modification,
  };
  
  // Words and word instances.
  const currentWords = state.editor.currentWord ? getStartingWords(state.editor.currentWord, state.words) : [];
  state.currentWords = flow(
    map(x => ({ word: x, instances: state.words[x] }))
  )(currentWords);
  if (state.selectedWord && !includes(state.selectedWord)(currentWords)) {
    state.selectedWord = undefined;
  }
  if (state.currentWords.length === 1) {
    state.selectedWord = state.currentWords[0];
  }
  state.currentWordInstances = state.selectedWord ? state.words[state.selectedWord] : [];

  // Rhymes and rhyme instances.
  const currentRhymes = state.selectedWord ?
    flow(
      filter(x => includes(state.selectedWord)(x.words)),
      map(x => x.words),
      flatten,
      uniq,
      filter(x => x !== state.selectedWord),
    )(state.rhymes) : [];
  state.currentRhymes = flow(
    map(x => ({ word: x, instances: state.words[x] }))
  )(currentRhymes);
  if (state.selectedRhyme && !includes(state.selectedRhyme)(currentRhymes)) {
    state.selectedRhyme = undefined;
  }
  if (state.currentRhymes.length === 1) {
    state.selectedRhyme = currentRhymes[0];
  }
  state.currentRhymeInstances = state.selectedRhyme ? state.words[state.selectedRhyme] : [];

  saveState(state);
  return state;
};

const timeRegex = /(\d\d):(\d\d):(\d\d)/;
const timeToSeconds = (time: string): number => {
  if (!time)
    return 0;
  const m = time.match(timeRegex);
  if (m) {
    return 60 * 60 * parseInt(m[1]) + 60 * parseInt(m[2]) + parseInt(m[3]);
  } else {
    return 0;
  }
};

export default function rhymes(state: State = initialState, action: Action): State {
  switch (action.type) {
    case 'SELECT_WORD':
      return computeState(state, { selectedWord: action.word });
    case 'SELECT_RHYME':
      return computeState(state, { selectedRhyme: action.word });
    case 'SET_EDITOR_STATE':
      const editor = {
        state: action.editorState,
        currentWord: getEditorWord(action.editorState),
      };
      return computeState(state, { editor: editor });
    case 'LOAD_DATA_SUCCESS':
      return computeState(state, {
        words: mapValues(w => w.map(
          wi => ({
            ...wi,
            seconds: timeToSeconds(wi.time),
            video: find(v => v.video == wi.video)(action.videos)
          })
          ))(action.words),
        rhymes: action.rhymes,
        videos: action.videos,
      });
    default:
      return state;
  }
}