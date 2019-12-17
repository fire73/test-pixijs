import _ from 'lodash';
import React from 'react';
import './Game.css';
import * as PIXI from 'pixi.js'

export class Game extends React.Component {
  // constructor(props: any) {
  //   super(props);
  // }

  methodLeeMapping(mapLocation: number[][], sizeMap: number, maxLen: number, startPoint: number[]) {
    const mapWayS: number[][] = [];
    for (let i = 0; i < sizeMap; i += 1) {
      const row = [];
      for (let j = 0; j < sizeMap; j += 1) {
        row.push(255);
      }
      mapWayS.push(row);
    }

    // опеределим максимальную длину пути

    // берем начальную точку и от неё находим возможные варианты, сохраняем координаты возможных вариантов и
    const sp = startPoint;

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
          p[0] + 1 < sizeMap &&
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
          p[1] + 1 < sizeMap &&
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

  generatePath = (mapWayS: number[][], endPoint: number[], maxLen: number, sizeMap: number): number[][] => {
    const way: number[][] = [
      [endPoint[0], endPoint[1]]
    ];
    const ep = endPoint;
    // const mapWayS = this.state.mapWayS;

    let lpw = [ep[0], ep[1]];
    for (let i = 0; i < maxLen; i += 1) {
      const nowValue = mapWayS[lpw[0]][lpw[1]];
      if (lpw[0] - 1 > -1 && mapWayS[lpw[0] - 1][lpw[1]] < nowValue) {
        lpw = [lpw[0] - 1, lpw[1]];
        way.push(lpw);
        continue;
      }
      if (lpw[0] + 1 < sizeMap && mapWayS[lpw[0] + 1][lpw[1]] < nowValue) {
        lpw = [lpw[0] + 1, lpw[1]];
        way.push(lpw);
        continue;
      }
      if (lpw[1] + 1 < sizeMap && mapWayS[lpw[0]][lpw[1] + 1] < nowValue) {
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
    return way.map(el => el.reverse()).reverse();
  }

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
    const mapSize = 14;
    const mapW = mapSize;
    const mapH = mapSize;

    const balls: PIXI.Sprite[] = [];
    let activeBall: number[] = [];
    let selectedBall = false;

    const map: number[][] = [];
    const freeMap: { coords: number[] }[] = [];
    const boxes: PIXI.Sprite[] = [];
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
        // eslint-disable-next-line
        box.on('pointerdown', async () => {
          console.log(`clicked`, box.name, box.x, box.y);
          if (activeBall.length) {
            const pointBox = [box.x / 50, box.y / 50];
            const foundBall = balls.find(b => b.x === activeBall[0] * 50 && b.y === activeBall[1] * 50);
            if (!foundBall) {
              return;
            }
            const foundBox = boxes.find(b => b.x === foundBall.x && b.y === foundBall.y);
            console.log({
              foundBox
            })
            if (foundBox) {
              // foundBox.
              foundBox.tint = 0xCCCCCC;
            }
            const pointBall = [foundBall.x / 50, foundBall.y / 50];

            const mapping = this.methodLeeMapping(map, mapSize, 100, pointBall.reverse());
            const way = this.generatePath(mapping, pointBox.reverse(), 100, mapSize);

            console.log({
              pointBox,
              pointBall,
              mapping,
              way,
              wayL: way.length
            });

            if (way.length === 1) {
              activeBall = [];
              console.log('NO WAY');
              return;
            }

            const speed = 10;

            way.splice(0, 1);
            for (const wayEl of way) {
              // wayEl[0]
              const x = wayEl[0] * 50;
              const y = wayEl[1] * 50;
              const tickerWay = new PIXI.Ticker();
              await new Promise((r) => {
                tickerWay.add(() => {
                  if (foundBall.x === x && foundBall.y === y) {
                    // clearTimeout(timeout);
                    r();
                  }
                  if (foundBall.x < x) {
                    foundBall.x += speed;
                  }
                  if (foundBall.x > x) {
                    foundBall.x -= speed;
                  }
                  if (foundBall.y < y) {
                    foundBall.y += speed;
                  }
                  if (foundBall.y > y) {
                    foundBall.y -= speed;
                  }
                })
                tickerWay.start();
              });
              tickerWay.stop();
              tickerWay.destroy();
            }
            map[pointBall[0]][pointBall[1]] = 0;
            map[pointBox[0]][pointBox[1]] = (-activeBall[2]) - 1;
            // if (!foundBall) {
            //   return;
            // }
            // foundBall.x = box.x;
            // foundBall.y = box.y;
            // map[activeBall[1]][activeBall[0]] = 0;
            // map[point[1]][point[0]] = (-activeBall[2])-1;
            console.log('map', map)
          }
          // console.log(balls.find(b => b.x === ))
        });
        stage.addChild(box);
        boxes.push(box);
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

        if (selectedBall) {
          const foundBox = boxes.find(b => b.x === activeBall[0] * 50 && b.y === activeBall[1] * 50);
          console.log({
            foundBox
          })
          if (foundBox) {
            // foundBox.
            foundBox.tint = 0xCCCCCC;
          }
        }

        activeBall = [ball.x / 50, ball.y / 50, textureId];

        console.log('activeBall', activeBall);
        selectedBall = true;

        const foundBox = boxes.find(b => b.x === ball.x && b.y === ball.y);
        console.log({
          foundBox
        })
        if (foundBox) {
          // foundBox.
          foundBox.tint = 0x48D1CC;
        }
        // const tickerBall = new PIXI.Ticker();
        // const startBall = {
        //   x: ball.x,
        //   y: ball.y
        // }
        // tickerBall.add(() => {
        //   if (!selectedBall) {

        //   }
        //   ball.x = _.random(1) === 1 ? ball.x - _.random(2) : ball.x + _.random(2);
        //   ball.y = _.random(1) === 1 ? ball.y - _.random(2) : ball.y + _.random(2);
        // });
        // tickerBall.start();
        // const timeout = setTimeout(() => {
        //   tickerBall.stop();
        //   tickerBall.destroy();
        //   ball.x = startBall.x;
        //   ball.y = startBall.y;
        //   selectedBall = false;
        //   activeBall = [];
        //   clearTimeout(timeout);
        // }, 3000);
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
    const countStartBalls = 70;
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
      renderer.render(stage);
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