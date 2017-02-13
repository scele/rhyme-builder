import { EditorState } from 'draft-js';
import { flow, keys, filter } from 'lodash/fp';

const initialState = {
  editor: EditorState.createEmpty(),
  currentWord: '',
  currentWordMatches: [],
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

const getSelectedText = (editorState) => {
  let selectionState = editorState.getSelection();
  let anchorKey = selectionState.getAnchorKey();
  let currentContent = editorState.getCurrentContent();
  let currentContentBlock = currentContent.getBlockForKey(anchorKey);
  let start = selectionState.getStartOffset();
  let end = selectionState.getEndOffset();
  return currentContentBlock.getText().slice(start, end);
};

const getCurrentWord = (editorState) => {
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

export default function rhymes(state = initialState, action) {
  switch (action.type) {
    case 'SET_EDITOR_STATE':
      const currentWord = getCurrentWord(action.editorState);
      return {
        ...state,
        editor: action.editorState,
        currentWord: currentWord,
        currentWordMatches: currentWord.length === 0 ? [] : getStartingWords(currentWord, state.words),
      };
    case 'LOAD_DATA_SUCCESS':
      return {
        words: action.words,
        rhymes: action.rhymes,
        text: '',
        ...state,
      };
    default:
      return state;
  }
}