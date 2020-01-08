import React from 'react';
import App from './App';
import { ColorLines } from './ColorLines'
import { Shooter } from './Shooter'
import { Actors } from './actors_test/Actors'
import { Switch, Route, Link } from 'react-router-dom';

class Home extends React.Component {
  render() {
    return (
      <div className="Home">
        <nav>
          <ul>
            <li><Link to='/color-lines'>Color lines</Link></li>
            <li><Link to='/method-lee'>Method lee</Link></li>
            <li><Link to='/shooter'>Shooter</Link></li>
            <li><Link to='/actors'>Actors</Link></li>
          </ul>
        </nav>
      </div>
    );
  }
}

export class Main extends React.Component {


  render() {
    return (
      <div className="Main">
        <div className="Switch">
          <Switch>
            <Route path='/' exact component={Home} />
            <Route path='/color-lines' component={ColorLines} />
            <Route path='/method-lee' component={App} />
            <Route path='/shooter' component={Shooter} />
            <Route path='/actors' component={Actors} />
          </Switch>
        </div>
      </div>
    )
  }
}