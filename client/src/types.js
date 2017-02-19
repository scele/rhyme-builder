// @flow
import type { Store as ReduxStore, Dispatch as ReduxDispatch } from 'redux';

// https://flowtype.org/blog/2016/10/04/Property-Variance.html

export type Word = {
  actor: string,
  video: string,
  time: string,
};

type WordMap = {[id:string]: Array<Word>};
type Rhyme = {
  rhyme: string,
  total: number,
  words: string[],
};

type SelectedRhyme = {
  word: string,
  numInstances: number
};

export type State = {
  editor: Object,
  editorWord: ?string,
  currentWords: Array<string>,
  selectedWord: ?string,
  currentWordInstances: Array<Word>,
  currentRhymes: SelectedRhyme[],
  selectedRhyme: ?SelectedRhyme,
  currentRhymeInstances: Array<Word>,
  words: WordMap,
  rhymes: Rhyme[],
};

export type Action =
    { type: 'SET_EDITOR_STATE', editorState: Object }
  | { type: 'LOAD_DATA_SUCCESS' }
  | { type: 'SELECT_RHYME', word: ?string }
  | { type: 'SELECT_WORD', word: ?string }
  ;

export type Store = ReduxStore<State, Action>;

export type Dispatch = ReduxDispatch<Action>;