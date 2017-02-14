// React
import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, browserHistory } from 'react-router';

// Redux
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import createLogger from 'redux-logger';

// Material UI
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

// Application
import App from './App';
import './index.css';
import rootReducer from './reducers';
import { loadVersion, loadData } from './actions';

const store = createStore(
  rootReducer,
  compose(
    applyMiddleware(thunk, createLogger()),
  )
);

store.dispatch(loadVersion());
store.dispatch(loadData());

ReactDOM.render(
  <MuiThemeProvider>
    <Provider store={store}>
      <Router history={browserHistory}>
        <Route path='/' component={App} />
      </Router>
    </Provider>
  </MuiThemeProvider>,
  document.getElementById('root')
);
