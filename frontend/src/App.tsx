import React from 'react';
import { Router } from '@reach/router';

import Main from './pages/Main';

import 'semantic-ui-css/semantic.min.css';
import './App.css';

const App = () => (
  <div className="App">
    <Router>
      <Main path="/" />
    </Router>
  </div>
);

export default App;
