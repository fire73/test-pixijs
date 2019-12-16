import _ from 'lodash';
import React from 'react';
import './Game.css';
import * as PIXI from 'pixi.js'

export class Game extends React.Component {
  // constructor(props: any) {
  //   super(props);
  // }

  componentDidMount() {
    const canvas = document.getElementById('canvasGame');
    // const app = new PIXI.Application({
    //   width: 700,
    //   height: 700,
    //   // backgroundColor: 0xcccccc,
    //   transparent: true
    // });
    const renderer = new PIXI.Renderer({
      view: canvas as HTMLCanvasElement,
      width: 700,
      height: 700,
      resolution: window.devicePixelRatio,
      autoDensity: true,
      transparent: true
    });

    const stage = new PIXI.Container();

    // The application will create a canvas element for you that you
    // can then insert into the DOM.
    // document.body.appendChild(app.view);

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

    const balls: PIXI.Sprite[] = [];
    let activeBall: number[] = [];

    const map: number[][] = [];
    const freeMap: { coords: number[] }[] = [];

    for (let i = 0; i < mapW; i += 1) {
      const line: number[] = [];
      for (let j = 0; j < mapH; j += 1) {
        // var texture = PIXI.generateTexture(graphics);
        // const box = new PIXI.Sprite();
        const box = new PIXI.Sprite(PIXI.Texture.WHITE);
        box.x = j * 50;
        box.y = i * 50;
        box.tint = 0xCCCCCC;
        box.width = 45;
        box.height = 45;
        box.buttonMode = true;
        box.interactive = true;
        box.name = `${j}_${i}`;
        // box.position
        box.on('pointerdown', () => {
          console.log(`clicked`, box.name, box.x, box.y);
          if (activeBall.length) {
            const foundBall = balls.find(b => b.x === activeBall[0] * 50 && b.y === activeBall[1] * 50);
            if (!foundBall) {
              return;
            }
            foundBall.x = box.x;
            foundBall.y = box.y;
            map[activeBall[1]][activeBall[0]] = 0;
            map[box.y/50][box.x/50] = (-activeBall[2])-1;
            console.log('map', map)
          }
          // console.log(balls.find(b => b.x === ))
        });
        stage.addChild(box);
        line.push(0);
        freeMap.push({
          coords: [j, i]
        })
      }
      map.push(line);
    }
    const ballsTexture = [
      '13', '11', '04', '19', '06'
    ];
    let chaos = false;

    function createBall(x: number, y: number, textureId: number, point: number[]) {
      const ball = PIXI.Sprite.from(`coloredspheres/sphere-${ballsTexture[textureId]}.png`);
      ball.x = x;
      ball.y = y;
      ball.width = 45;
      ball.height = 45;
      ball.buttonMode = true;
      ball.interactive = true;
      ball.name = `${point[0]}_${point[1]}`;
      ball.on('pointerdown', () => {
        console.log(`clicked ball`, ball.name);
        // chaos = !chaos;
        // const foundBall = balls.find(b => b.name === ball.name);
        // if (!foundBall) {
        //   return;
        // }
        activeBall = [ball.x / 50, ball.y / 50, textureId];
        console.log('activeBall', activeBall);
      });
      balls.push(ball)
      stage.addChild(ball);
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
      const index = _.random((mapW * mapH) - i - 1);
      const point = freeMap[index];
      const textureId = _.random(4);
      freeMap.splice(index, 1);
      createBall(point.coords[0] * 50, point.coords[1] * 50, textureId, point.coords);
      map[point.coords[1]][point.coords[0]] = -(textureId) - 1;
    }

    // console.log('balls', balls);

    // console.log(balls.find(b => b.x === ))

    // app.ticker.add(() => {
    //   if(chaos) {
    //     balls.forEach(ball => {
    //       ball.x = _.random(1) === 1 ? ball.x - _.random(2) : ball.x + _.random(2);
    //       ball.y = _.random(1) === 1 ? ball.y - _.random(2) : ball.y + _.random(2);
    //     })
    //   }
    // });

    // createBall(100, 150, 0);
    console.log('map', map);

    const ticker = new PIXI.Ticker();
    ticker.add(animate);
    ticker.start();

    function animate() {
      renderer.render(stage)
    }

  }

  render() {
    return (
      <div className="Game">
        <canvas id="canvasGame"></canvas>
      </div>
    );
  }
}