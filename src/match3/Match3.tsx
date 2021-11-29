import React from 'react';
import * as PIXI from 'pixi.js'
import './style.css';
import _, { map, uniqueId } from 'lodash';
import Physics from './physics';
import { SpriteBall, SpriteMap, Dimensions } from './types';

export class Match3 extends React.Component {

    dimensions: Dimensions = {
        element: {
            width: 50,
            height: 50,
            animation: {
                speed: 7,
            }
        },
        levelSize: {
            row: 5, // строка
            col: 5, // столбец
            spacing: 6,
        },
        levelMap: [
            ['11', '20', '11', '20', '20'],
            ['14', '11', '04', '11', '14'],
            ['11', '14', '20', '14', '11'],
            ['20', '20', '11', '20', '11'],
            ['14', '11', '20', '11', '14'],
        ],
    };

    levelHeight =
        this.dimensions.levelSize.row * this.dimensions.element.height +
        (this.dimensions.levelSize.spacing * this.dimensions.levelSize.row) + this.dimensions.levelSize.spacing;

    levelWidth =
        this.dimensions.levelSize.col * this.dimensions.element.width +
        (this.dimensions.levelSize.spacing * this.dimensions.levelSize.col) + this.dimensions.levelSize.spacing;

    animationFall = true;

    public balls: SpriteBall[] = [];

    public stage = new PIXI.Container();

    componentDidMount() {
        const canvas = document.getElementById('canvasGame');


        const renderWidth = this.levelWidth;
        const renderHeight = this.levelHeight;

        const renderer = new PIXI.Renderer({
            view: canvas as HTMLCanvasElement,
            width: renderWidth,
            height: renderHeight,
            resolution: window.devicePixelRatio,
            autoDensity: true,
            transparent: true
        });

        const stage = this.stage;

        const elementsMap: SpriteMap[] = [];

        const mapMaps: { [key: string]: SpriteMap } = {};
        const balls = this.balls;

        const changeBalls: {
            active: SpriteBall | undefined,
            target: SpriteBall | undefined,
        } = {
            active: undefined,
            target: undefined,
        };

        const physics = new Physics(stage, balls, elementsMap, mapMaps, this.dimensions);

        const _createBall = (x: number, y: number, color: undefined | string = undefined) => {
            const listColors = ['11', '14', '20', '16', '04'];
            const postfix = !color ? listColors[_.random(0, listColors.length - 1)] : color;
            const ball = PIXI.Sprite.from(`coloredspheres/sphere-${postfix}.png`) as SpriteBall;

            ball.color = postfix;

            ball.x = x;
            ball.y = y;

            ball.buttonMode = true;
            ball.interactive = true;

            ball.width = this.dimensions.element.width;
            ball.height = this.dimensions.element.height;
            ball.zIndex = 2000;
            ball.name = _.uniqueId();

            ball.on('pointerdown', () => clickBall(this, ball));

            return ball;
        }

        async function clickBall(_this: Match3, ball: SpriteBall) {
            console.log('click', JSON.stringify({
                map: ball.map,
                name: ball.name
            }));

            if (!changeBalls.active) {
                // если это первый клик на элементе
                changeBalls.active = ball;
                ball.alpha = 0.3;
            } else {
                // если клик уже был
                if (changeBalls.active.name === ball.name) {
                    // если второй клик по тому же элементу
                    ball.alpha = 1;
                    changeBalls.active = undefined;
                    console.log('клиу уже был');
                    return;
                }

                // проверить, что клик по соседним элементам
                const nearbyBalls = physics.getNearbyBalls(changeBalls.active);
                let isNearby = false;

                console.log('nearbyBalls', nearbyBalls.map(nb => {
                    return {
                        ...nb.map,
                        name: nb.name,
                    }
                }));

                for (const _ball of nearbyBalls) {
                    if (_ball.name === ball.name) {
                        isNearby = true;
                        break;
                    }
                }

                if (!isNearby) {
                    changeBalls.active.alpha = 1;
                    changeBalls.active = undefined;

                    console.log('клик не по соседнему элементу', ball.map, ball.name);
                    return;
                }


                changeBalls.target = ball;
                ball.alpha = 0.3;

                await physics.swap(changeBalls.active, changeBalls.target);

                await new Promise((r) => setTimeout(r, 200));

                // проверить на комбинацию

                // взять текущие координаты map
                // сравнить с color соседние по x элементы
                // по двум change элементам 

                // changeBalls.active.map

                const combination = [];

                const ballsCheck = [
                    changeBalls.active,
                    changeBalls.target,
                ];

                for (const ballCheck of ballsCheck) {
                    const combBallX = [];
                    //  влево
                    for (let ix = ballCheck.map.x - 1; ix >= 0; ix -= 1) {
                        const founBall = balls.find(_ball => _ball.map.y === ballCheck?.map.y && _ball.map.x === ix);

                        if (founBall?.color === ballCheck.color) {
                            combBallX.push(founBall);
                        } else {
                            break;
                        }
                    }

                    // вправо
                    for (let ix = ballCheck.map.x + 1; ix <= _this.dimensions.levelSize.col; ix += 1) {
                        const founBall = balls.find(_ball => _ball.map.y === ballCheck?.map.y && _ball.map.x === ix);

                        if (founBall?.color === ballCheck.color) {
                            combBallX.push(founBall);
                        } else {
                            break;
                        }
                    }

                    if (combBallX.length >= 2) {
                        const comb = [...combBallX];
                        // console.log(ballCheck.name, comb.map(c => c.map));
                        combination.push(...comb);
                    }

                    const combBallY = [];

                    //  вверх
                    for (let iy = ballCheck.map.y - 1; iy >= 0; iy -= 1) {
                        const founBall = balls.find(_ball => _ball.map.y === iy && _ball.map.x === ballCheck?.map.x);

                        if (founBall?.color === ballCheck.color) {
                            combBallY.push(founBall);
                        } else {
                            break;
                        }
                    }

                    // вниз
                    for (let iy = ballCheck.map.y + 1; iy <= _this.dimensions.levelSize.row; iy += 1) {
                        const founBall = balls.find(_ball => _ball.map.y === iy && _ball.map.x === ballCheck?.map.x);

                        if (founBall?.color === ballCheck.color) {
                            combBallY.push(founBall);
                        } else {
                            break;
                        }
                    }

                    console.log('Y комбинация', combBallY.map(c => c.map));
                    if (combBallY.length >= 2) {
                        const comb = [...combBallY];
                        combination.push(...comb);
                    }

                    if (combBallX.length >= 2 || combBallY.length >= 2) {
                        combination.push(ballCheck);
                        // console.log(ballCheck.name, comb.map(c => c.map));
                    }


                }

                if (combination.length >= 3) {
                    // ok
                    console.log('combination ok', combination.map(comb => comb.map));
                    await physics.moveDown(combination, clickBall);
                } else {
                    console.log('недостаточная комбинация', combination.map(c => c.map));
                    await physics.swap(changeBalls.target, changeBalls.active);
                }

                changeBalls.active.alpha = 1;
                changeBalls.target.alpha = 1;
                changeBalls.active = undefined;
                changeBalls.target = undefined;
            }
        }

        async function removeBall(_this: Match3, ball: SpriteBall) {
            const thisBallIndex = balls.findIndex(_ball => _ball.map.x === ball.map.x && _ball.map.y === ball.map.y);

            // Найти все вышестоящие элементы
            // взять текущие координаты map
            // фильтровать массив по map.x, где y < ball.y

            const upBalls = balls
                .filter((_ball) => _ball.map.x === ball.map.x && _ball.map.y < ball.map.y);

            // изменить map.y у найденных
            // const downBalls = balls
            //     .filter((_ball) => _ball.map.x === ball.map.x && _ball.map.y > ball.map.y);

            // 
            // const downBallsCount = downBalls.length;

            upBalls.forEach(_ball => {
                const mapY = _ball.map.y + 1;
                const elMap = mapMaps[`${_ball.map.x}_${mapY}`];
                _ball.isNeedDraw = true;
                _ball.map = {
                    x: elMap._pX,
                    y: elMap._pY,
                };
                // console.log('elMap', elMap.x, elMap.y, _ball.x, _ball.y);
            });

            console.log({
                upBalls: upBalls.map(b => b.map),
                thisBallIndex,
                // downBalls: downBalls.map(b => b.map),
            });

            // создать нужное количество элементов за областью поля
            // узнать, сколько элементов нужно создать
            // пока что один

            const newBall = physics.createBall(ball.x, -ball.height, clickBall);
            newBall.map = {
                x: ball.map.x,
                y: 0,
            };
            newBall.isNeedDraw = true;

            balls.push(newBall);
            stage.addChild(newBall);

            ball.destroy();
            balls.splice(thisBallIndex, 1);

            // пройтись по всем элементам и у кого есть флаг, то меняем позицию
            const needDrawBalls = balls.filter(_ball => _ball.isNeedDraw === true);

            const animationSpeed = _this.dimensions.element.animation.speed;

            const tickerAnimBalls = new PIXI.Ticker();

            await new Promise((r) => {
                let doneAnim = 0;
                tickerAnimBalls.add(() => {
                    needDrawBalls.forEach(_ball => {
                        const mapEl = physics.getMapByBall(_ball);
                        if (_ball.y !== mapEl.y) {
                            if (_ball.y < mapEl.y) {
                                if (_ball.y + animationSpeed > mapEl.y) {
                                    _ball.y = mapEl.y;
                                } else {
                                    _ball.y += animationSpeed;
                                }
                            }
                        } else {
                            doneAnim += 1;
                            _ball.isNeedDraw = false;
                        }
                    });

                    if (needDrawBalls.length === doneAnim) {
                        r(true);
                    }
                });

                tickerAnimBalls.start();
            });

            tickerAnimBalls.stop();
            tickerAnimBalls.destroy();
        }

        function createElementMap(_this: Match3, x: number, y: number, i: number, j: number, colorBall: undefined | string = undefined) {
            // 11 14 20 16
            // const listColors = ['11', '14', '20', '16', '04'];
            // const randomImgPostfix = _.random(0, 2);
            // const postfix = listColors[_.random(0, listColors.length - 1)];
            // const elementMap = PIXI.Sprite.from(`coloredspheres/sphere-${postfix}.png`);

            const elementMap = new PIXI.Sprite(PIXI.Texture.WHITE) as SpriteMap;

            elementMap.tint = 0xCCCCCC;
            // elementMap.

            elementMap.width = _this.dimensions.element.width;
            elementMap.height = _this.dimensions.element.height;
            elementMap.x = x;
            elementMap.y = y;
            elementMap.buttonMode = true;
            elementMap.interactive = true;
            // elementMap.name = `map_${elements.length + 1}`;
            elementMap.name = `${x}_${y}`;
            elementMap.zIndex = 3000;

            elementMap._pX = i;
            elementMap._pY = j;


            elementMap._color = _.random(0, 4);
            // elementMap.on('pointerdown', async () => {
            //     // const foundIndex = elements.findIndex(el => el.name === element.name);
            //     console.log('click', elementMap);
            // });
            mapMaps[`${i}_${j}`] = elementMap;

            stage.addChild(elementMap);
            elementsMap.push(elementMap);

            const ball = physics.createBall(x, y, clickBall, colorBall);
            ball.map = {
                x: i,
                y: j,
            };

            balls.push(ball);
            // stage.addChild(ball);
        }

        for (let j = 0; j < this.dimensions.levelSize.row; j += 1) {
            for (let i = 0; i < this.dimensions.levelSize.col; i += 1) {
                createElementMap(
                    this,
                    this.dimensions.element.width * i + (this.dimensions.levelSize.spacing * (i + 1)),
                    this.dimensions.element.height * j + (this.dimensions.levelSize.spacing * (j + 1)),
                    i, j,
                    this.dimensions.levelMap[j][i]
                );
            }
        }

        // this.dimensions.levelMap.forEach(elRow => {

        // });

        balls.forEach(ball => {
            stage.addChild(ball);
        });

        const ticker = new PIXI.Ticker();
        ticker.add(() => this.animate(renderer, stage));
        ticker.start();
    }

    test() {
        console.log(this.balls.map(ball => {
            return {
                name: ball.name,
                map: ball.map,
            }
        }));
    }

    animate(renderer: PIXI.Renderer, stage: PIXI.Container) {
        renderer.render(stage);
    }

    render() {
        return <div className="Match3">
            <canvas id="canvasGame"></canvas>
            <div>
                <button onClick={this.test.bind(this)}>test</button>
            </div>
        </div>
    }
}