import React from 'react';
import { Button } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css';
import './MagicBox.css';

export class MagicBox extends React.Component {

  renderColors() {
    return <div className="box-colors">
      <div className="color-row"></div>
      <div className="color-row"></div>
      <div className="color-row"></div>
    </div>
  }

  render() {
    return <div className="MagicBox">
      {this.renderColors()}
    </div>
  }
}