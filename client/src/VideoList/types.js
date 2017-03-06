// @flow

import type { Video, ServerVideoMap } from '../types';
import type { Store as ReduxStore, Dispatch as ReduxDispatch } from 'redux';

export type State = {
  videos: ServerVideoMap,
  filteredVideos: Video[],
  filter: string,
};

export type Action =
    { type: 'VIDEO_LIST:SET_FILTER', filter: string }
  ;

export type Store = ReduxStore<State, Action>;
export type Dispatch = ReduxDispatch<Action>;