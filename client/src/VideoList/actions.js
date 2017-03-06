// @flow

import type { Dispatch } from './types';

export const SET_FILTER = 'VIDEO_LIST:SET_FILTER';

export const setFilter = (filter: string) => (dispatch: Dispatch) => {
  return dispatch({
    type: SET_FILTER,
    filter: filter,
  });
};