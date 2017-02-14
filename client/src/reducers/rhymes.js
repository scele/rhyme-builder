import { EditorState } from 'draft-js';
import { flow, keys, filter, contains, map, flatten, uniq } from 'lodash/fp';

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

const getSelectedText = (editorState) => {
  let selectionState = editorState.getSelection();
  let anchorKey = selectionState.getAnchorKey();
  let currentContent = editorState.getCurrentContent();
  let currentContentBlock = currentContent.getBlockForKey(anchorKey);
  let start = selectionState.getStartOffset();
  let end = selectionState.getEndOffset();
  return currentContentBlock.getText().slice(start, end);
};

const getEditorWord = (editorState) => {
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


const initialState = {
  editor: EditorState.createEmpty(),
  editorWord: undefined,
  currentWords: [],
  selectedWord: undefined,
  currentWordInstances: [],
  currentRhymes: [],
  selectedRhyme: undefined,
  currentRhymeInstances: [],
};

const computeState = (state, modification) => {
  state = {
    ...state,
    ...modification,
  };
  
  // Words and word instances.
  state.currentWords = state.editorWord ? getStartingWords(state.editorWord, state.words) : [];
  if (state.selectedWord && !contains(state.selectedWord)(state.currentWords)) {
    state.selectedWord = undefined;
  }
  if (state.currentWords.length === 1) {
    state.selectedWord = state.currentWords[0];
  }
  state.currentWordInstances = state.selectedWord ? state.words[state.selectedWord] : [];
  
  // Rhymes and rhyme instances.
  const currentRhymes = state.selectedWord ?
    flow(
      filter(x => contains(state.selectedWord)(x.words)),
      map(x => x.words),
      flatten,
      uniq,
    )(state.rhymes) : [];
  state.currentRhymes = flow(
    map(x => ({ word: x, numInstances: state.words[x].length }))
  )(currentRhymes);
  if (state.selectedRhyme && !contains(state.selectedRhyme)(currentRhymes)) {
    state.selectedRhyme = undefined;
  }
  if (state.currentRhymes.length === 1) {
    state.selectedRhyme = currentRhymes[0];
  }
  state.currentRhymeInstances = state.selectedRhyme ? state.words[state.selectedRhyme] : [];

  return state;
};

export default function rhymes(state = initialState, action) {
  switch (action.type) {
    case 'SELECT_WORD':
      return computeState(state, { selectedWord: action.word });
    case 'SELECT_RHYME':
      return computeState(state, { selectedRhyme: action.word });
    case 'SET_EDITOR_STATE':
      return computeState(state, { editor: action.editorState, editorWord: getEditorWord(action.editorState) });
    case 'LOAD_DATA_SUCCESS':
      return {
        ...state,
        words: action.words,
        rhymes: action.rhymes,
        text: '',
      };
    default:
      return state;
  }
}