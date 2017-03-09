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
    // TODO: Better search
    filter((video: Video) => video.speakers.join(' ').toLowerCase().includes(state.filter.toLowerCase())
                             || video.title.toLowerCase().includes(state.filter.toLowerCase())
                             || video.video.toLowerCase().includes(state.filter.toLowerCase())),
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