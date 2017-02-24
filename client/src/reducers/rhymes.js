// @flow

import { EditorState, convertFromRaw, convertToRaw } from 'draft-js';
import { flow, keys, filter, includes, map, flatten, uniq, mapValues, find, orderBy, uniqBy } from 'lodash/fp';
import type { State, Action, Word, RhymingWord, WordInstance } from '../types';

const loadState = (): $Shape<State> => {
  try {
    const persisted: $Shape<State> = JSON.parse(localStorage.getItem('state') || '');
    return {
      editor: {
        state: EditorState.createWithContent(convertFromRaw(persisted.editor.state)),
        currentWord: persisted.editor.currentWord,
      },
      //selectedWord: persisted.selectedWord,
      //selectedRhyme: persisted.selectedRhyme,
    };
  } catch(err) {
    return {
      editor: {
        state: EditorState.createEmpty(),
        currentWord: null,
      },
      //selectedWord: undefined,
      //selectedRhyme: undefined,
    };
  }
};

const saveState = (state: State) => {
  localStorage.setItem('state', JSON.stringify({
    editor: {
      state: convertToRaw(state.editor.state.getCurrentContent()),
      currentWord: state.editor.currentWord,
    },
    selectedWord: state.selectedWord ? state.selectedWord.str : null,
    selectedRhymingWord: state.selectedRhymingWord ? state.selectedRhymingWord.str : null,
  }));
};

const initialState: State = {
  ...loadState(),
  currentWords: [],
  selectedWord: null,
  selectedRhymingWord: null,
  words: {},
  rhymes: {},
  videos: [],
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
      filter(x => x.word !== state.selectedWord),
      map(x => ({
          ...getWord(state, false)(x.word),
          rhyme: x.rhyme,
      })),
      // Array<{rhyme: string, word: Word}>
    )(state.words[wordStr].rhymes);

  const getWordInstances = (state: State) => (wordStr: string): WordInstance[] =>
    state.words[wordStr].instances;

  const getWord = (state: State, expandRhymes: boolean) => (wordStr: string): Word =>
    ({
      str: wordStr,
      instances: getWordInstances(state)(wordStr),
      //rhymes: expandRhymes ? getRhymes(state)(wordStr) : [],
      rhymingWords: expandRhymes ? getRhymingWords(state)(wordStr) : [],
    });

  const isSameWord = (word1: ?Word) => (word2: ?Word) =>
    word1 && word2 && word1.str == word2.str;

  let currentWords: string[] = state.editor.currentWord ? getStartingWords(state.editor.currentWord, state.words) : [];
  state.currentWords = map(getWord(state, true))(currentWords);
  state.selectedWord = find(isSameWord(state.selectedWord))(state.currentWords);
  if (state.currentWords.length === 1) {
    state.selectedWord = state.currentWords[0];
  }

  if (state.selectedWord) {
    const rhymingWords = state.selectedWord.rhymingWords;
    state.selectedRhymingWord = find(isSameWord(state.selectedRhymingWord))(rhymingWords);
    if (rhymingWords.length === 1) {
      state.selectedWord = rhymingWords[0];
    }
  }

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
      return computeState(state, { selectedRhymingWord: action.word });
    case 'SET_EDITOR_STATE':
      const editor = {
        state: action.editorState,
        currentWord: getEditorWord(action.editorState),
      };
      return computeState(state, { editor: editor });
    case 'LOAD_DATA_SUCCESS':
      return computeState(state, {
        words: mapValues(w => ({
          ...w,
          instances: w.instances.map((wi) => ({
            ...wi,
            video: find(v => v.video == wi.video)(action.videos),
          })),
        }))(action.words),
        rhymes: action.rhymes,
        videos: action.videos,
      });
    default:
      return state;
  }
}