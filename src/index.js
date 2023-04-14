import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Info from './Info';
import Garbo from './garbo';
import {BrowserRouter as Router, Route} from "react-router-dom";

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <div>
        <Route exact path="/" component={App} />
        <Route exact path="/gamer/:Username" component={Info} />
        <Route exact path="/yourtrash" component={Garbo} />
      </div>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);
