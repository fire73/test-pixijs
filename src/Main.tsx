import React from 'react';
import App from './App';
import { Game } from './Game'
import { Switch, Route, Link } from 'react-router-dom';

export class Main extends React.Component {
  render() {
    return (
      <div className="Main">
        <nav>
          <ul>
            <li><Link to='/color-lines'>Color lines</Link></li>
            <li><Link to='/method-lee'>Method lee</Link></li>
          </ul>
        </nav>
        <div className="Switch">
          <Switch>
            <Route path='/color-lines' component={Game} />
            <Route path='/method-lee' component={App} />
          </Switch>
        </div>
      </div>
    )
  }
}