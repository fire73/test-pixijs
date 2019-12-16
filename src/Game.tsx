import _ from 'lodash';
import React from 'react';
import './Game.css';
import * as PIXI from 'pixi.js'

export class Game extends React.Component {
  // constructor(props: any) {
  //   super(props);
  // }

  componentDidMount() {
    const app = new PIXI.Application({
      width: 700,
      height: 700,
      // backgroundColor: 0xcccccc,
      transparent: true
    });

    // The application will create a canvas element for you that you
    // can then insert into the DOM.
    document.body.appendChild(app.view);

    // const graphics = new PIXI.Graphics();
    // graphics.lineStyle(2, 0x000000, 1);
    // graphics.beginFill(0xC0CCCC);
    // graphics.drawRect(0, 0, 50, 50);
    // graphics.endFill();

    // const renderer = PIXI.autoDetectRenderer();
    // const texture = graphics.
    const mapSize = 10;
    const mapW = mapSize;
    const mapH = mapSize;

    const map: number[][] = [];
    const freeMap: { coords: number[] }[] = [];

    for (let i = 0; i < mapW; i += 1) {
      const line: number[] = [];
      for (let j = 0; j < mapH; j += 1) {
        // var texture = PIXI.generateTexture(graphics);
        // const box = new PIXI.Sprite();
        const box = new PIXI.Sprite(PIXI.Texture.WHITE);
        box.x = i * 50;
        box.y = j * 50;
        box.tint = 0xCCCCCC;
        box.width = 45;
        box.height = 45;
        box.buttonMode = true;
        box.interactive = true;
        box.name = `${j}_${i}`;
        // box.position
        box.on('pointerdown', () => {
          console.log(`clicked`, box.name, box.x, box.y);
        });
        app.stage.addChild(box);
        line.push(0);
        freeMap.push({
          coords: [i, j]
        })
      }
      map.push(line);
    }
    const ballsTexture = [
      '13', '11', '04', '19', '06'
    ];

    function createBall(x: number, y: number, textureId: number) {
      const ball = PIXI.Sprite.from(`coloredspheres/sphere-${ballsTexture[textureId]}.png`);
      ball.x = x;
      ball.y = y;
      ball.width = 45;
      ball.height = 45;
      app.stage.addChild(ball);
    }
    // console.log({
    //   freeMap
    // });
    // map.forEach((line, key1) => {
    //   line.forEach((item, key2) => {

    //   });
    // });
    const countStartBalls = 5;
    for (let i = 0; i < countStartBalls; i += 1) {
      const index = _.random((mapW*mapH)-i-1);
      const point = freeMap[index];
      const textureId = _.random(4);
      freeMap.splice(index, 1);
      createBall(point.coords[0] * 50, point.coords[1] * 50, textureId);
      map[point.coords[0]][point.coords[1]] = -(textureId) - 1;
    }

    console.log({
      map
    })

  }

  render() {
    return (
      <div className="Game">
      </div>
    );
  }
}