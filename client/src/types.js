// @flow
import type { Store as ReduxStore, Dispatch as ReduxDispatch } from 'redux';

// https://flowtype.org/blog/2016/10/04/Property-Variance.html

// Types that we get from the server
export type WordInstance = {
  actor: string,
  time: string,
  seconds: number,
  video: Video,
  context: string,
};

export type ServerWord = {
  word: string,
  rhymes: string[],
  instances: WordInstance[],
};

export type ServerRhyme = {
  rhyme: string,
  total: number,
  words: string[],
};

export type ServerWordMap = {[id:string]: ServerWord};
export type ServerRhymeMap = {[id:string]: ServerRhyme};
export type ServerVideoMap = {[id:number]: Video};

// Types that we use on the client

export type RhymingWord = Word & {
  rhyme: string,
};

export type Word = {
  str: string,
  //rhymes: Rhyme[],
  rhymingWords: RhymingWord[],
  instances: WordInstance[],
};

export type Rhyme = {
  str: string,
  total: number,
  words: Word[],
};

export type Video = {
  actor: string,
  title: string,
  text: string,
  video: string,
  lores: string,
  id: number,
  firstAnnotationTime: number,
  speakers: string[],
};


export type State = {
  editor: {
    state: Object,
    currentWord: ?string,
  },

  currentWords: Word[],
  currentRhymingWords: RhymingWord[],
  selectedWord: ?Word,
  selectedRhymingWord: ?RhymingWord,

  filteredVideos: Video[],

  words: ServerWordMap,
  rhymes: ServerRhymeMap,
  videos: ServerVideoMap,
};

export type Action = any;/*
    { type: 'SET_EDITOR_STATE', editorState: Object }
  | { type: 'LOAD_DATA_SUCCESS', words: ServerWordMap, rhymes: ServerRhymeMap, videos: ServerVideoMap }
  | { type: 'SELECT_RHYME', word: ?string }
  | { type: 'SELECT_WORD', word: ?string }
  | { type: 'VIDEO_UPDATED', video: Video }
  | { type: 'LOAD_VERSION_SUCCESS', response: Object }
  | { type: string }
  ;*/

export type Store = ReduxStore<State, Action>;
export type Dispatch = ReduxDispatch<Action>;