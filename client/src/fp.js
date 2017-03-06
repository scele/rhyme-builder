// @flow
import { find } from 'lodash/fp';

export function findOrOnly<T>(predicate: T => boolean): (list: Array<T>) => ?T
{
  return list => list.length === 1 ? list[0] : find(predicate)(list);
}

