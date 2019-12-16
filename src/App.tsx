import React from 'react';
import './App.css';

class App extends React.Component {

  state: {
    sizeMap: number;
    maxLen: number;
    MAP: number[][];
    way: number[][];
    mapWayS: number[][];
    startPoint: number[];
    endPoint: number[];
  } = {
      mapWayS: [],
      way: [],
      maxLen: 100,
      endPoint: [13, 12],
      startPoint: [0, 4],
      sizeMap: 15,
      MAP: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
      ]
    }

  constructor(props: any) {
    super(props)
    this.state.MAP = this.generateMap(this.state.sizeMap);
  }

  methodLeeMapping() {
    const mapLocation = this.state.MAP;
    const mapWayS: number[][] = [];
    for (let i = 0; i < this.state.sizeMap; i += 1) {
      const row = [];
      for (let j = 0; j < this.state.sizeMap; j += 1) {
        row.push(255);
      }
      mapWayS.push(row);
    }

    // опеределим максимальную длину пути
    const maxLen = this.state.maxLen;

    // берем начальную точку и от неё находим возможные варианты, сохраняем координаты возможных вариантов и
    const sp = this.state.startPoint;

    mapWayS[sp[0]][sp[1]] = 0;
    let lastPoints = [[sp[0], sp[1]]];
    let numberPoint = 1;
    for (let it = 0; it < maxLen; it += 1) {
      const newLastPoints: number[][] = [];
      // eslint-disable-next-line
      lastPoints.forEach(p => {
        if (
          p[0] - 1 > -1 &&
          mapWayS[p[0] - 1][p[1]] === 255 &&
          mapLocation[p[0] - 1][p[1]] >= 0
        ) {
          newLastPoints.push([p[0] - 1, p[1]]);
          mapWayS[p[0] - 1][p[1]] = numberPoint;
        }
        if (
          p[0] + 1 < this.state.sizeMap &&
          mapWayS[p[0] + 1][p[1]] === 255 &&
          mapLocation[p[0] + 1][p[1]] >= 0
        ) {
          newLastPoints.push([p[0] + 1, p[1]]);
          mapWayS[p[0] + 1][p[1]] = numberPoint;
        }
        if (
          p[1] - 1 > -1 &&
          mapWayS[p[0]][p[1] - 1] === 255 &&
          mapLocation[p[0]][p[1] - 1] >= 0
        ) {
          newLastPoints.push([p[0], p[1] - 1]);
          mapWayS[p[0]][p[1] - 1] = numberPoint;
        }
        if (
          p[1] + 1 < this.state.sizeMap &&
          mapWayS[p[0]][p[1] + 1] === 255 &&
          mapLocation[p[0]][p[1] + 1] >= 0
        ) {
          newLastPoints.push([p[0], p[1] + 1]);
          mapWayS[p[0]][p[1] + 1] = numberPoint;
        }
      });
      numberPoint += 1;
      lastPoints = newLastPoints;
    }
    this.setState({
      mapWayS
    })
    return mapWayS;
  }

  generatePath = () => {
    const mapWayS = this.methodLeeMapping();
    const way: number[][] = [];
    const ep = this.state.endPoint;
    const maxLen = this.state.maxLen;
    // const mapWayS = this.state.mapWayS;

    let lpw = [ep[0], ep[1]];
    for (let i = 0; i < maxLen; i += 1) {
      const nowValue = mapWayS[lpw[0]][lpw[1]];
      if (lpw[0] - 1 > -1 && mapWayS[lpw[0] - 1][lpw[1]] < nowValue) {
        lpw = [lpw[0] - 1, lpw[1]];
        way.push(lpw);
        continue;
      }
      if (lpw[0] + 1 < this.state.sizeMap && mapWayS[lpw[0] + 1][lpw[1]] < nowValue) {
        lpw = [lpw[0] + 1, lpw[1]];
        way.push(lpw);
        continue;
      }
      if (lpw[1] + 1 < this.state.sizeMap && mapWayS[lpw[0]][lpw[1] + 1] < nowValue) {
        lpw = [lpw[0], lpw[1] + 1];
        way.push(lpw);
        continue;
      }
      if (lpw[1] - 1 > -1 && mapWayS[lpw[0]][lpw[1] - 1] < nowValue) {
        lpw = [lpw[0], lpw[1] - 1];
        way.push(lpw);
        continue;
      }
    }
    // way.s
    way.splice(way.length - 1, 1);
    this.setState({
      way
    });
    console.log({
      way
    })
  }

  clickMapElement = (e: any, point: number[]) => {
    console.log(point)
    const map = this.state.MAP;
    map[point[0]][point[1]] = map[point[0]][point[1]] === 0 ? -1 : 0;
    this.setState({
      MAP: map,
      way: []
    });

  }

  generateMap = (size: number) => {
    const map: number[][] = [];
    for (let i = 0; i < size; i += 1) {
      const mapCols: number[] = [];
      for (let k = 0; k < size; k += 1) {
        mapCols.push(0);
      }
      map.push(mapCols)
    }
    console.log(map);
    return map;
  }

  getMap = (map: number[][], clickMapElement: any) => {
    const mapRows: any[] = [];
    let key = 0;
    map.forEach((row, key1) => {
      const mapCols: any[] = [];
      row.forEach((col, key2) => {
        let className = 'mapElement';
        if (this.state.startPoint[0] === key1 && this.state.startPoint[1] === key2) {
          className = 'mapElementStart'
        }
        if (this.state.endPoint[0] === key1 && this.state.endPoint[1] === key2) {
          className = 'mapElementEnd'
        }
        if (this.state.way.find(el => el[0] === key1 && el[1] === key2)) {
          className = 'mapElementWay'
        }
        if (col === -1) {
          className = 'mapElementBlock'
        }
        key += 1;
        const point = [key1, key2];
        mapCols.push(
          <div className={className} key={key} onClick={(e) => clickMapElement(e, point)}>[{key1},{key2}]</div>
        )
      })
      mapRows.push(
        <div className="mapRow" key={`row_${key1}`}>
          {mapCols}
        </div>
      )
    })
    return mapRows;
  }

  clear = () => {
    this.setState({ way: [], MAP: this.generateMap(this.state.sizeMap) });
  }

  render() {
    return (
      <div>
        <button onClick={this.generatePath}>generate path</button>
        <button onClick={this.clear}>clear</button>
        <div className="map">
          {this.getMap(this.state.MAP, this.clickMapElement)}
        </div>
      </div>
    );
  }
}

export default App;
