// React
import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, browserHistory } from 'react-router';

// Redux
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import createLogger from 'redux-logger';

// Application
import App from './App';
import './index.css';
import rootReducer from './reducers';
import { loadVersion } from './actions';

const store = createStore(
  rootReducer,
  compose(
    applyMiddleware(thunk, createLogger()),
  )
);

store.dispatch(loadVersion());

ReactDOM.render(
  <Provider store={store}>
    <Router history={browserHistory}>
      <Route path='/' component={App} />
    </Router>
  </Provider>,
  document.getElementById('root')
);
