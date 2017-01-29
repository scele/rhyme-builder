import { combineReducers } from 'redux';
import version from './version';

const rootReducer = combineReducers({
  version,
});

export default rootReducer;