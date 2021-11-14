import React from 'react';
import * as PIXI from 'pixi.js'
import './style.css';
import _, { map, uniqueId } from 'lodash';

export class Match3 extends React.Component {

    dimensions = {
        element: {
            width: 50,
            height: 50,
            animation: {
                speed: 10,
            }
        },
        levelSize: {
            row: 8, // строка
            col: 8, // столбец
            spacing: 6,
        }
    }

    levelHeight =
        this.dimensions.levelSize.row * this.dimensions.element.height +
        (this.dimensions.levelSize.spacing * this.dimensions.levelSize.row) + this.dimensions.levelSize.spacing;

    levelWidth =
        this.dimensions.levelSize.col * this.dimensions.element.width +
        (this.dimensions.levelSize.spacing * this.dimensions.levelSize.col) + this.dimensions.levelSize.spacing;

    animationFall = true;

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

        const stage = new PIXI.Container();

        const elementsMap: SpriteMap[] = [];


        interface SpriteMap extends PIXI.Sprite {
            _color: number;
            _id: string;
            _pX: number;
            _pY: number;
        }

        interface SpriteBall extends PIXI.Sprite {
            map: {
                x: number;
                y: number;
            },
            isNeedDraw: boolean,
        }

        const mapMaps: { [key: string]: SpriteMap } = {};
        const balls: SpriteBall[] = [];

        const changeBalls: {
            active: SpriteBall | undefined,
            target: SpriteBall | undefined,
        } = {
            active: undefined,
            target: undefined,
        };

        const createBall = (x: number, y: number) => {
            const listColors = ['11', '14', '20', '16', '04'];
            const postfix = listColors[_.random(0, listColors.length - 1)];
            const ball = PIXI.Sprite.from(`coloredspheres/sphere-${postfix}.png`) as SpriteBall;

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

        function getNearbyBalls(ball: SpriteBall): SpriteBall[] {
            return balls.filter(_ball => {
                return (
                    // _ball.map.x === ball.map.x + 1
                    // || _ball.map.x === ball.map.x - 1
                    // || _ball.map.y === ball.map.y + 1
                    // || _ball.map.y === ball.map.y - 1
                    (_ball.map.x === ball.map.x + 1 && _ball.map.y === ball.map.y)
                    || (_ball.map.x === ball.map.x - 1 && _ball.map.y === ball.map.y)
                    || (_ball.map.y === ball.map.y + 1 && _ball.map.x === ball.map.x)
                    || (_ball.map.y === ball.map.y - 1 && _ball.map.x === ball.map.x)
                );
            });
        }

        async function clickBall(_this: Match3, ball: SpriteBall) {
            console.log(`click ${ball.name}`);
            // const thisBallIndex = balls.findIndex(_ball => _ball.map.x === ball.map.x && _ball.map.y === ball.map.y);

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
                    return;
                }

                // проверить, что клик по соседним элементам
                const nearbyBalls = getNearbyBalls(changeBalls.active);
                console.log({
                    nearbyBalls,
                })
                let isNearby = false;

                for (const _ball of nearbyBalls) {
                    if (_ball.name === ball.name) {
                        isNearby = true;
                        break;
                    }
                }

                if (!isNearby) {
                    changeBalls.active.alpha = 1;
                    changeBalls.active = undefined;

                    return;
                }

                changeBalls.target = ball;
                ball.alpha = 0.3;

                // поменять их map местами
                const activeMap = { ...changeBalls.active.map };
                const targetMap = { ...changeBalls.target.map };

                changeBalls.active.map = targetMap;
                changeBalls.target.map = activeMap;

                const tickerChangeBalls = new PIXI.Ticker();

                const animationSpeed = 5;

                await new Promise(r => {
                    const mapElActive = getMapByBall(changeBalls.active as SpriteBall);
                    const mapElTarget = getMapByBall(changeBalls.target as SpriteBall);

                    const activeBall = changeBalls.active as SpriteBall;
                    const targetBall = changeBalls.target as SpriteBall;
                    
                    // let isDoneAnimate = false;
                    tickerChangeBalls.add(() => {
                        // x
                        if (activeBall.x < mapElActive.x) {
                            if (activeBall.x + animationSpeed > mapElActive.x) {
                                activeBall.x = mapElActive.x;
                            } else {
                                activeBall.x += animationSpeed;
                            }
                        }
                        
                        if (activeBall.x > mapElActive.x) {
                            if (activeBall.x - animationSpeed < mapElActive.x) {
                                activeBall.x = mapElActive.x;
                            } else {
                                activeBall.x -= animationSpeed;
                            }
                        }
                        // ----
                        if (targetBall.x < mapElTarget.x) {
                            if (targetBall.x + animationSpeed > mapElTarget.x) {
                                targetBall.x = mapElTarget.x;
                            } else {
                                targetBall.x += animationSpeed;
                            }
                        }
                        
                        if (targetBall.x > mapElTarget.x) {
                            if (targetBall.x - animationSpeed < mapElTarget.x) {
                                targetBall.x = mapElTarget.x;
                            } else {
                                targetBall.x -= animationSpeed;
                            }
                        }

                        // y
                        if (activeBall.y < mapElActive.y) {
                            if (activeBall.y + animationSpeed > mapElActive.y) {
                                activeBall.y = mapElActive.y;
                            } else {
                                activeBall.y += animationSpeed;
                            }
                        }
                        
                        if (activeBall.y > mapElActive.y) {
                            if (activeBall.y - animationSpeed < mapElActive.y) {
                                activeBall.y = mapElActive.y;
                            } else {
                                activeBall.y -= animationSpeed;
                            }
                        }
                        // ----
                        if (targetBall.y < mapElTarget.y) {
                            if (targetBall.y + animationSpeed > mapElTarget.y) {
                                targetBall.y = mapElTarget.y;
                            } else {
                                targetBall.y += animationSpeed;
                            }
                        }
                        
                        if (targetBall.y > mapElTarget.y) {
                            if (targetBall.y - animationSpeed < mapElTarget.y) {
                                targetBall.y = mapElTarget.y;
                            } else {
                                targetBall.y -= animationSpeed;
                            }
                        }

                        if (
                            activeBall.x === mapElActive.x 
                            && targetBall.x === mapElTarget.x
                            && activeBall.y === mapElActive.y 
                            && targetBall.y === mapElTarget.y
                        ) {
                            r(true);
                        }
                    });

                    tickerChangeBalls.start();
                });

                tickerChangeBalls.stop();
                tickerChangeBalls.destroy();

                changeBalls.active.alpha = 1;
                changeBalls.target.alpha = 1;
                changeBalls.active = undefined;
                changeBalls.target = undefined;
            }

            console.log(changeBalls);

        }

        async function _clickBall(_this: Match3, ball: SpriteBall) {
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

            const newBall = createBall(ball.x, -ball.height);
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
                        const mapEl = getMapByBall(_ball);
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

        function getMapByBall(ball: SpriteBall) {
            return mapMaps[`${ball.map.x}_${ball.map.y}`];
        }

        function createElementMap(_this: Match3, x: number, y: number, i: number, j: number) {
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

            const ball = createBall(x, y);
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
                    i, j
                );
            }
        }

        balls.forEach(ball => {
            stage.addChild(ball);
        });

        const ticker = new PIXI.Ticker();
        ticker.add(() => this.animate(renderer, stage));
        ticker.start();
    }

    animate(renderer: PIXI.Renderer, stage: PIXI.Container) {
        renderer.render(stage);
    }

    render() {
        return <div className="Match3">
            <canvas id="canvasGame"></canvas>
        </div>
    }
}