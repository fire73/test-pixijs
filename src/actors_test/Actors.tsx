import React from 'react';
import { Button } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css';
import axios from 'axios';
import './Actors.css';

export class Actors extends React.Component {
  urlGraphql = 'http://192.168.0.105:3300/graphql';
  state: { name: string; img: string, checkedName: string, actorId: number, statisticYes: number } = {
    name: '',
    img: '',
    checkedName: '',
    actorId: 0,
    statisticYes: 0
  }

  async api(query: string) {
    const { data } = await axios.post(this.urlGraphql, {
      query: `${query}`
    });
    return data;
  }

  async getRandomActor() {
    const result = await this.api(`query {
      getNextActors(
        id: 5
      ) {
        id
        name
        rating
        image
      }
    }`);
    console.log(result.data.getNextActors);
    this.setState({
      name: result.data.getNextActors.name,
      img: result.data.getNextActors.image,
      actorId: result.data.getNextActors.id,
      checkedName: '',
    });
    await this.getStatisticYes();
  }

  componentDidMount() {
    this.getRandomActor();
  }

  checkName = () => {
    this.setState({
      checkedName: this.state.name
    })
  }

  async getStatisticYes() {
    const result = await this.api(`query {
      getStatusYES(
        userId: 5
      )
    }`);
    this.setState({
      statisticYes: result.data.getStatusYES
    })
  }

  async setStatus(userId: number, actorId: number, status: string) {
    await this.api(`mutation {
      setStatus(
        status: "${status}",
        userId: ${userId},
        actorId: ${actorId}
      )
    }`);
    await this.getRandomActor();
  }

  setYes = async () => {
    await this.setStatus(5, this.state.actorId, 'yes');
  }
  
  setNo = async () => {
    await this.setStatus(5, this.state.actorId, 'no');
  }

  setSkip = async () => {
    await this.setStatus(5, this.state.actorId, 'skip');
  }

  render() {
    return <div className="Actors">
      <h3>yes: {this.state.statisticYes}</h3>
      <div className="actorImg">
        <img src={`http://192.168.0.105:3300/img/small/${this.state.img}`} alt="actor" />
      </div>
      <div>
        <h3>{this.state.checkedName}</h3>
        <Button primary onClick={this.checkName}>CHECK</Button>
      </div>
      <hr />
      <div>
        <Button negative onClick={this.setNo}>NO</Button>
        <Button color="grey" onClick={this.setSkip}>SKIP</Button>
        <Button positive onClick={this.setYes}>YES</Button>
      </div>
    </div>
  }
}