import { combineReducers } from 'redux';
import version from './version';
import rhymes from './rhymes';

const rootReducer = combineReducers({
  version,
  rhymes,
});

export default rootReducer;