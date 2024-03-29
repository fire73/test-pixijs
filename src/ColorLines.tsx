import _ from 'lodash';
import React from 'react';
import './ColorLines.css';
import * as PIXI from 'pixi.js'

export class ColorLines extends React.Component {
  // constructor(props: any) {
  //   super(props);
  // }
  state: {
    score: number;
    x2: number;
    statisticColors: {
      typeColor: number;
      count: number;
    }[],
    ballsTexture: string[],
    nextBalls: number[]
  } = {
      score: 0,
      x2: 0,
      statisticColors: [],
      ballsTexture: [],
      nextBalls: []
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
    const statisticColors: {
      typeColor: number;
      count: number;
    }[] = [];
    const ballsTexture = [
      '13', '11', '04', '16', '06', '02', '23'
    ];
    this.setState({
      ballsTexture
    })
    const randomColorsCount = 5;
    const mapSize = 9;
    const countStartBalls = 5;
    const countNewBalls = 3;
    const mapW = mapSize;
    const mapH = mapSize;

    const balls: PIXI.Sprite[] = [];
    const aniBalls: { sprite: PIXI.Sprite, anim: { direction: number } }[] = [];
    let nextBalls = [];
    for (let i = 0; i < countNewBalls; i += 1) {
      nextBalls.push(_.random(randomColorsCount - 1))
    }
    this.setState({
      nextBalls
    })

    let activeBall: number[] = [];
    let selectedBall = false;
    let moovingBall = false;
    let score = 0;
    let x2check = 0;
    let animActiveBall: any = undefined;

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
            // (animActiveBall as PIXI.Sprite).
            const pointBox = [box.x / 50, box.y / 50];
            const foundBall = balls.find(b => b.x === activeBall[0] * 50 && b.y === activeBall[1] * 50);
            if (!foundBall) {
              return;
            }
            foundBall.scale.set(0);
            foundBall.width = 45;
            foundBall.height = 45;

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

            animActiveBall = undefined;
            // foundBall.scale.set(1);
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
                    r(true);
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
                  // const textureId = _.random(randomColorsCount - 1);
                  const textureId = this.state.nextBalls[nb - 1];
                  createBall(point[0] * 50, point[1] * 50, textureId, point);
                  const { isWinLine: isNowWin, score: nowScoreCreateBall } = await checkWinLines(point.reverse());
                  if (isNowWin) {
                    this.setState({
                      score: nowScoreCreateBall
                    });
                    this.setState({
                      statisticColors
                    });
                  }
                } else {
                  gameOver = true;
                }
              }

              const freeMapNow = checkFreeMap();
              if (!freeMapNow.length) {
                gameOver = true;
              }
              // 
              if (gameOver) {
                alert('game over');
                document.location.reload();
              }
              x2check = 0;
            } else {
              x2check += 1;
              if (x2check >= 2) {
                this.setState({
                  x2: this.state.x2 + 1
                })
              }
              this.setState({
                score: nowScore
              });
              this.setState({
                statisticColors
              });
            }
            let nextBalls = [];
            for (let i = 0; i < countNewBalls; i += 1) {
              nextBalls.push(_.random(randomColorsCount - 1))
            }
            this.setState({
              nextBalls
            })

            console.log(this.state.nextBalls);

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
      if (isWinLine) {
        // statisticColors.push({

        // })
        console.log('thisBallType', thisBallType);
        const foundSt = statisticColors.find(st => st.typeColor === thisBallType);
        if (foundSt) {
          foundSt.count += 1;
        } else {
          statisticColors.push({
            count: 1,
            typeColor: thisBallType
          })
        }
      }
      return { isWinLine, score };
    }

    async function removeBalls(points: number[][]) {
      const removeBalls: { sprite: { x: number, y: number, width: number, height: number }, textureId: number }[] = [];
      for (const p of points) {
        const textureId = map[p[0]][p[1]];
        map[p[0]][p[1]] = 0;
        // найти шарик
        // удалить
        const foundBallRemoveIndex = balls.findIndex(b => b.x === p[1] * 50 && b.y === p[0] * 50);
        const foundBallRemove = balls[foundBallRemoveIndex];

        if (foundBallRemove) {
          removeBalls.push({
            sprite: {
              height: foundBallRemove.height,
              width: foundBallRemove.width,
              x: foundBallRemove.x,
              y: foundBallRemove.y,
            },
            textureId: Math.abs(textureId)
          });
          foundBallRemove.destroy();
          balls.splice(foundBallRemoveIndex, 1);
        }
      }

      for (const item of removeBalls) {
        const newAniBall = PIXI.Sprite.from(`coloredspheres/sphere-${ballsTexture[item.textureId - 1]}.png`);
        newAniBall.x = item.sprite.x;
        newAniBall.y = item.sprite.y;
        newAniBall.width = item.sprite.width;
        newAniBall.height = item.sprite.height;
        aniBalls.push({
          sprite: newAniBall,
          anim: {
            direction: _.random(3)
          }
        });
        stage.addChild(newAniBall);
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

        if (animActiveBall) {
          animActiveBall.scale.set(0);
          animActiveBall.width = 45;
          animActiveBall.height = 45;
        }

        if (selectedBall) {
          // const foundBox = boxes.find(b => b.x === activeBall[0] * 50 && b.y === activeBall[1] * 50);
          // if (foundBox) {
          //   foundBox.tint = 0xCCCCCC;
          // }

        }

        activeBall = [ball.x / 50, ball.y / 50, textureId];

        selectedBall = true;

        // const foundBox = boxes.find(b => b.x === ball.x && b.y === ball.y);

        // if (foundBox) {
        //   foundBox.tint = 0x48D1CC;
        // }

        animActiveBall = ball;
        // ball.anchor.set(0);
        // ball.scale.set(0.3)
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

    let deltaAnim = 0;
    function animate() {
      renderer.render(stage);
      if (animActiveBall) {
        const activeBallSpritre = animActiveBall as PIXI.Sprite;
        deltaAnim += 0.1;
        const scale = 0.1 + Math.abs(Math.sin(deltaAnim) / 15);
        // console.log(scale);
        // activeBallSpritre.anchor.set(2);
        // // activeBallSpritre.transform.
        activeBallSpritre.scale.set(scale);

      }
      if (aniBalls.length) {
        aniBalls.forEach((aniBall, key) => {
          if (aniBall.anim.direction === 0) {
            if (aniBall.sprite.x > -10) {
              deltaAnim += 0.2;
              aniBall.sprite.x -= 10;
              aniBall.sprite.y += Math.sin(deltaAnim) * 10;
            } else {
              aniBall.sprite.destroy();
              aniBalls.splice(key, 1);
            }
          }
          if (aniBall.anim.direction === 1) {
            if (aniBall.sprite.x < mapW * 50) {
              deltaAnim += 0.2;
              aniBall.sprite.x += 10;
              aniBall.sprite.y += Math.sin(deltaAnim) * 10;
            } else {
              aniBall.sprite.destroy();
              aniBalls.splice(key, 1);
            }
          }
          if (aniBall.anim.direction === 2) {
            if (aniBall.sprite.y < mapH * 50) {
              deltaAnim += 0.2;
              aniBall.sprite.y += 10;
              aniBall.sprite.x += Math.sin(deltaAnim) * 10;
            } else {
              aniBall.sprite.destroy();
              aniBalls.splice(key, 1);
            }
          }
          if (aniBall.anim.direction === 3) {
            if (aniBall.sprite.y > -10) {
              deltaAnim += 0.2;
              aniBall.sprite.y -= 10;
              aniBall.sprite.x += Math.sin(deltaAnim) * 10;
            } else {
              aniBall.sprite.destroy();
              aniBalls.splice(key, 1);
            }
          }
        });
      }
    }

  }

  getStatistic() {
    return <div>
      {this.state.statisticColors.map((el, key) => {
        const indexType = (Math.abs(el.typeColor) - 1);
        return <div key={key}>
          <img width="25" height="25" src={`coloredspheres/sphere-${this.state.ballsTexture[indexType]}.png`} alt="Logo" /> : {el.count}
        </div>
      })}
    </div>
  }

  getNextBalls() {
    return <div>
      {this.state.nextBalls.map(index => {
        return <img alt="nextBall" width="25" height="25" src={`coloredspheres/sphere-${this.state.ballsTexture[index]}.png`}/> 
      })}
    </div>
  }

  render() {
    return (
      <div className="Game">
        <h3>score: {this.state.score}</h3>
        <h3>combo: {this.state.x2} </h3>
        {this.getNextBalls()}
        <canvas id="canvasGame"></canvas>
        {this.getStatistic()}
      </div>
    );
  }
}