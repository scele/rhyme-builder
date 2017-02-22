// @flow
import type { Store as ReduxStore, Dispatch as ReduxDispatch } from 'redux';

// https://flowtype.org/blog/2016/10/04/Property-Variance.html

export type Word = {
  actor: string,
  time: string,
  seconds: number,
  video: Video,
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

type Video = {
  actor: string,
  title: string,
  text: string,
  video: string,
};

export type State = {
  editor: {
    state: Object,
    currentWord: ?string,
  },
  currentWords: Array<string>,
  selectedWord: ?string,
  currentWordInstances: Array<Word>,
  currentRhymes: SelectedRhyme[],
  selectedRhyme: ?string,
  currentRhymeInstances: Array<Word>,
  words: WordMap,
  rhymes: Rhyme[],
  videos: Video[],
  selectedWordInstance: ?string,
  selectedRhymeInstance: ?string,
};

export type Action =
    { type: 'SET_EDITOR_STATE', editorState: Object }
  | { type: 'LOAD_DATA_SUCCESS', words: WordMap, rhymes: Rhyme[], videos: Video[] }
  | { type: 'SELECT_RHYME', word: ?string }
  | { type: 'SELECT_WORD', word: ?string }
  | { type: 'LOAD_VERSION_SUCCESS', response: Object }
  ;

export type Store = ReduxStore<State, Action>;

export type Dispatch = ReduxDispatch<Action>;