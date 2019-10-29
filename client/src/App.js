import React, { Component } from 'react';
import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import Game from './pages/game/Game'
import Home from './pages/home/Home'




class App extends Component {
  render() {
    return (
      <Router className="App">
        <Switch>
          <Route path="/game" render={(props) => <Game {...props} />}>
         
          </Route>
          <Route path="/">
            <Home />
          </Route>
        </Switch>
      </Router>
    );
  }
}

export default App;