import { combineReducers } from 'redux';
import version from './version';
import rhymes from './rhymes';
import videoInspector from '../VideoInspector/reducer';
import videoList from '../VideoList/reducer';

const rootReducer = combineReducers({
  version,
  rhymes,
  videoList,
  videoInspector,
});

export default rootReducer;