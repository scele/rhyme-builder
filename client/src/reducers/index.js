import { combineReducers } from 'redux';
import version from './version';
import rhymes from './rhymes';
import videoInspector from './videoInspector';

const rootReducer = combineReducers({
  version,
  rhymes,
  videoInspector,
});

export default rootReducer;