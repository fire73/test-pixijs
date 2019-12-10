import React from 'react';
import './App.css';

class App extends React.Component {

  
  constructor(props: any) {
    super(props)
    this.state = {
      sizeMap: 15,
      MAP: []
    }

    this.setState({
      sizeMap: 25
    })
  }

  // clickMapElement = () => {
  //   console.log(`sd`)
  // }

  // generateMap = () => {
  //   const map: number[][] = [];
  //   for (let i = 0; i < this.sizeMap; i += 1) {
  //     const mapCols: number[] = [];
  //     for (let k = 0; k < this.sizeMap; k += 1) {
  //       mapCols.push(i+k === 5 ? -1 : 0);
  //     }
  //     map.push(mapCols)
  //   }
  //   console.log(map);
  //   return map;
  // }

  // // this.state = 

  // getMap = (map: number[][], clickMapElement: any) => {
  //   const mapRows: any[] = [];
  //   map.forEach(row => {
  //     const mapCols: any[] = [];
  //     row.forEach(col => {
  //       let className = 'mapElement';
  //       if (col === -1) {
  //         className = 'mapElementBlock'
  //       }
  //       mapCols.push(
  //         <div className={className} onClick={clickMapElement}></div>
  //       )
  //     })
  //     mapRows.push(
  //       <div className="mapRow">
  //         {mapCols}
  //       </div>
  //     )
  //   })
  //   return mapRows;
  // }

  render() {
    return (
      <div>
        {this.state.sizeMap}
        <div className="map">
          {/* {this.getMap()} */}
        </div>
      </div>
    );
  }
}

export default App;
