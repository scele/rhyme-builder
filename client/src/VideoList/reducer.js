// @flow

import { flow, filter, take, values } from 'lodash/fp';
import type { Action } from './types';
import type { Video } from '../types';
import type { State } from './types';
import { SET_FILTER } from './actions';

const initialState: State = {
  videos: {},
  filteredVideos: [],
  filter: '',
};

const filterVideos = (state: State): Video[] => {
  return flow(
    values,
    filter((video: Video) => video.text.includes(state.filter) || video.title.includes(state.filter)),
    take(10)
  )(state.videos);
};

const updateFilteredVideos = (state: State): State => ({
  ...state,
  filteredVideos: filterVideos(state),
});

export default function reducer(state: State = initialState, action: Action): State {
  switch (action.type) {
    case SET_FILTER:
      return updateFilteredVideos({
        ...state,
        filter: action.filter,
      });
    case 'LOAD_DATA_SUCCESS':
      return updateFilteredVideos({
        ...state,
        videos: action.videos,
      });
    case 'VIDEO_UPDATED':
      const updatedVideos = { ...state.videos };
      updatedVideos[action.video.id] = action.video;
      return updateFilteredVideos({
        ...state,
        videos: updatedVideos,
      });
    default:
      return state;
  }
}