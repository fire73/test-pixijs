import _ from 'lodash';
import React from 'react';
import './Game.css';
import * as PIXI from 'pixi.js'

export class Game extends React.Component {
  // constructor(props: any) {
  //   super(props);
  // }
  state = {
    score: 0
  }

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

    const renderer = new PIXI.Renderer({
      view: canvas as HTMLCanvasElement,
      width: 450,
      height: 450,
      resolution: window.devicePixelRatio,
      autoDensity: true,
      transparent: true
    });

    const stage = new PIXI.Container();
    const ballsTexture = [
      '13', '11', '04', '16', '06', '02', '23'
    ];
    const randomColorsCount = 5;
    const mapSize = 9;
    const countStartBalls = 5;
    const countNewBalls = 3;
    const mapW = mapSize;
    const mapH = mapSize;

    const balls: PIXI.Sprite[] = [];
    let activeBall: number[] = [];
    let selectedBall = false;
    let moovingBall = false;
    let score = 0;

    const map: number[][] = [];
    const freeMap: { coords: number[] }[] = [];
    const boxes: PIXI.Sprite[] = [];

    for (let i = 0; i < mapW; i += 1) {
      const line: number[] = [];
      for (let j = 0; j < mapH; j += 1) {
        const box = new PIXI.Sprite(PIXI.Texture.WHITE);
        box.x = j * 50;
        box.y = i * 50;
        box.tint = 0xCCCCCC;
        box.width = 45;
        box.height = 45;
        box.buttonMode = true;
        box.interactive = true;
        box.name = `${j}_${i}`;
        // eslint-disable-next-line
        box.on('pointerdown', async () => {
          if (activeBall.length) {
            const pointBox = [box.x / 50, box.y / 50];
            const foundBall = balls.find(b => b.x === activeBall[0] * 50 && b.y === activeBall[1] * 50);
            if (!foundBall) {
              return;
            }
            const foundBox = boxes.find(b => b.x === foundBall.x && b.y === foundBall.y);
            if (foundBox) {
              foundBox.tint = 0xCCCCCC;
            }
            const pointBall = [foundBall.x / 50, foundBall.y / 50];

            const mapping = this.methodLeeMapping(map, mapSize, 100, pointBall.reverse());
            const way = this.generatePath(mapping, pointBox.reverse(), 100, mapSize);

            if (way.length === 1) {
              activeBall = [];
              console.log('NO WAY');
              return;
            }

            moovingBall = true;

            const speed = 25;

            way.splice(0, 1);
            for (const wayEl of way) {
              const x = wayEl[0] * 50;
              const y = wayEl[1] * 50;
              const tickerWay = new PIXI.Ticker();
              await new Promise((r) => {
                tickerWay.add(() => {
                  if (foundBall.x === x && foundBall.y === y) {
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

            const pb = pointBox;
            const { isWinLine, score: nowScore } = await checkWinLines(pb);
            let gameOver = false;

            if (!isWinLine) {
              for (let nb = 1; nb <= countNewBalls; nb += 1) {
                const freeMapNow = checkFreeMap();
                if (freeMapNow.length) {
                  const index = _.random(freeMapNow.length - 1);
                  const point = freeMapNow[index];
                  const textureId = _.random(randomColorsCount - 1);
                  createBall(point[0] * 50, point[1] * 50, textureId, point);
                  const { isWinLine: isNowWin, score: nowScoreCreateBall } = await checkWinLines(point.reverse());
                  if (isNowWin) {
                    this.setState({
                      score: nowScoreCreateBall
                    });
                  }
                } else {
                  gameOver = true;
                }
              }
              // 
              if (gameOver) {
                alert('game over');
                document.location.reload();
              }

            } else {
              this.setState({
                score: nowScore
              });
            }

            moovingBall = false;
          }
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

    async function checkWinLines(pb: number[]) {
      const thisBallType = map[pb[0]][pb[1]];

      // по горизонтали
      const lineH: number[][] = [
        [pb[0], pb[1]]
      ];
      const lineW: number[][] = [
        [pb[0], pb[1]]
      ];
      const lineD1: number[][] = [
        [pb[0], pb[1]]
      ];
      const lineD2: number[][] = [
        [pb[0], pb[1]]
      ];
      // налево
      for (let i = pb[1] - 1; i >= 0; i -= 1) {
        const value = map[pb[0]][i];
        if (value === thisBallType) {
          lineH.push([pb[0], i])
        } else {
          break;
        }
      }
      // направо
      for (let i = pb[1] + 1; i < mapSize; i += 1) {
        const value = map[pb[0]][i];
        if (value === thisBallType) {
          lineH.push([pb[0], i])
        } else {
          break;
        }
      }

      // по вертикали

      // вверх
      for (let i = pb[0] - 1; i >= 0; i -= 1) {
        const value = map[i][pb[1]];
        if (value === thisBallType) {
          lineW.push([i, pb[1]])
        } else {
          break;
        }
      }
      // вниз
      for (let i = pb[0] + 1; i < mapSize; i += 1) {
        const value = map[i][pb[1]];
        if (value === thisBallType) {
          lineW.push([i, pb[1]])
        } else {
          break;
        }
      }

      // диагональ1 
      // вверх 
      for (let i = pb[0] - 1, j = pb[1] - 1; i >= 0 && j >= 0; i -= 1, j -= 1) {
        const value = map[i][j];
        if (value === thisBallType) {
          lineD1.push([i, j])
        } else {
          break;
        }
      }
      // вниз
      for (let i = pb[0] + 1, j = pb[1] + 1; i < mapSize && j >= 0; i += 1, j += 1) {
        const value = map[i][j];
        if (value === thisBallType) {
          lineD1.push([i, j])
        } else {
          break;
        }
      }

      // диагональ2 
      // вверх 
      for (let i = pb[0] - 1, j = pb[1] + 1; i >= 0 && j < mapSize; i -= 1, j += 1) {
        const value = map[i][j];
        if (value === thisBallType) {
          lineD2.push([i, j])
        } else {
          break;
        }
      }
      // вниз
      for (let i = pb[0] + 1, j = pb[1] - 1; i < mapSize && j >= 0; i += 1, j -= 1) {
        const value = map[i][j];
        if (value === thisBallType) {
          lineD2.push([i, j])
        } else {
          break;
        }
      }

      let isWinLine = false;

      if (lineH.length >= 5) {
        console.log('WIN LINE');
        await removeBalls(lineH);
        isWinLine = true;
        score += lineH.length;
      }
      if (lineW.length >= 5) {
        console.log('WIN LINE');
        await removeBalls(lineW);
        isWinLine = true;
        score += lineW.length;
      }
      if (lineD1.length >= 5) {
        console.log('WIN LINE');
        await removeBalls(lineD1);
        isWinLine = true;
        score += lineD1.length;
      }
      if (lineD2.length >= 5) {
        console.log('WIN LINE');
        await removeBalls(lineD2);
        isWinLine = true;
        score += lineD2.length;
      }
      return { isWinLine, score };
    }

    async function removeBalls(points: number[][]) {
      for (const p of points) {
        map[p[0]][p[1]] = 0;
        // найти шарик
        // удалить
        const foundBallRemoveIndex = balls.findIndex(b => b.x === p[1] * 50 && b.y === p[0] * 50);
        const foundBallRemove = balls[foundBallRemoveIndex];

        if (foundBallRemove) {
          foundBallRemove.destroy();
          balls.splice(foundBallRemoveIndex, 1);
          await new Promise(r => {
            setTimeout(() => {
              r();
            }, 100)
          })
        }

      }
    }

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
        if (moovingBall) {
          return;
        }

        if (selectedBall) {
          const foundBox = boxes.find(b => b.x === activeBall[0] * 50 && b.y === activeBall[1] * 50);
          if (foundBox) {
            foundBox.tint = 0xCCCCCC;
          }
        }

        activeBall = [ball.x / 50, ball.y / 50, textureId];

        selectedBall = true;

        const foundBox = boxes.find(b => b.x === ball.x && b.y === ball.y);
        
        if (foundBox) {
          foundBox.tint = 0x48D1CC;
        }
      });
      balls.push(ball)
      stage.addChild(ball);
      map[point[1]][point[0]] = -(textureId) - 1;
    }

    for (let i = 0; i < countStartBalls; i += 1) {
      const index = _.random((mapW * mapH) - i - 1);
      const point = freeMap[index];
      const textureId = _.random(randomColorsCount - 1);
      freeMap.splice(index, 1);
      createBall(point.coords[0] * 50, point.coords[1] * 50, textureId, point.coords);
    }

    function checkFreeMap() {
      const freeMapCheck: number[][] = [];
      map.forEach((lineY, y) => {
        lineY.forEach((lineX, x) => {
          if (lineX === 0) {
            freeMapCheck.push([x, y]);
          }
        });
      });
      return freeMapCheck;
    }

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
        <h3>{this.state.score}</h3>
        <canvas id="canvasGame"></canvas>
      </div>
    );
  }
}