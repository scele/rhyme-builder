// @flow

import { EditorState } from 'draft-js';
import { flow, keys, filter, map, flatten, mapValues, find, orderBy, uniqBy } from 'lodash/fp';
import type { State, Action, Word, RhymingWord, WordInstance } from '../types';

const initialState: State = {
  editor: {
    state: EditorState.createEmpty(),
    currentWord: null,
  },
  currentWords: [],
  currentRhymingWords: [],
  selectedWord: null,
  selectedRhymingWord: null,
  words: {},
  rhymes: {},
  videos: [],
};

const getStartingWords = (search, words) =>
  flow(
    keys,
    filter((x) => x.startsWith(search))
  )(words);

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

// Forward declare getWord.
let getWord;

const getRhymingWords = (state: State) => (wordStr: string): RhymingWord[] =>
  flow(
    // Array<string>
    map(rhymeStr => map(word => ({ rhyme: rhymeStr, word: word }))(state.rhymes[rhymeStr].words)),
    // Array<Array<{rhyme: string, word: string}>>
    flatten,
    // Array<{rhyme: string, word: string}>
    orderBy(x => x.rhyme.length, 'desc'),
    // Array<{rhyme: string, word: string}>
    uniqBy(x => x.word),
    filter(x => x.word !== wordStr),
    map(x => ({
        ...getWord(state, false)(x.word),
        rhyme: x.rhyme,
    })),
    // Array<{rhyme: string, word: Word}>
  )(state.words[wordStr].rhymes);

const getWordInstances = (state: State) => (wordStr: string): WordInstance[] =>
  state.words[wordStr].instances;

getWord = (state: State, expandRhymes: boolean) => (wordStr: string): Word =>
  ({
    str: wordStr,
    instances: getWordInstances(state)(wordStr),
    rhymingWords: expandRhymes ? getRhymingWords(state)(wordStr) : [],
  });

const getCurrentWords = (state: State) =>
  map(getWord(state, true))(state.editor.currentWord ? getStartingWords(state.editor.currentWord, state.words) : []);

const updateSelectedRhymingWord = (state: State, word: ?string) => ({
  ...state,
  selectedRhymingWord: find(x => x.str === word)(state.currentRhymingWords),
});

const updateCurrentRhymingWords = (state: State) => updateSelectedRhymingWord({
  ...state,
  currentRhymingWords: state.selectedWord ? state.selectedWord.rhymingWords : [],
});

const updateSelectedWord = (state: State, word: ?string) => updateCurrentRhymingWords({
  ...state,
  selectedWord: find(x => x.str === word)(state.currentWords),
});

const updateCurrentWords = (state) => updateSelectedWord({
  ...state,
  currentWords: getCurrentWords(state),
});

export default function rhymes(state: State = initialState, action: Action): State {
  switch (action.type) {
    case 'SELECT_WORD':
      return updateSelectedWord(state, action.word);
    case 'SELECT_RHYME':
      return updateSelectedRhymingWord(state, action.word);
    case 'SET_EDITOR_STATE':
      return updateCurrentWords({
        ...state,
        editor: {
          state: action.editorState,
          currentWord: getEditorWord(action.editorState),
        },
      });
    case 'LOAD_DATA_SUCCESS':
      const mapWords = (words, videos) =>
        mapValues(w => ({
          ...w,
          instances: w.instances.map((wi) => ({
            ...wi,
            video: find(v => v.video === wi.video)(videos),
          })),
        }))(words);
      return updateCurrentWords({
        ...state,
        words: mapWords(action.words, action.videos),
        rhymes: action.rhymes,
        videos: action.videos,
      });
    default:
      return state;
  }
}