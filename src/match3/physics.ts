import * as PIXI from 'pixi.js';
import { SpriteBall, SpriteMap, Dimensions } from './types';
import _ from 'lodash';

class Physics {
    public stage: PIXI.Container;
    public balls: SpriteBall[];
    public elementsMap: SpriteMap[];
    public mapMaps: { [key: string]: SpriteMap };
    public dimensions: Dimensions;

    constructor(stage: PIXI.Container, balls: SpriteBall[], elementsMap: SpriteMap[], mapMaps: { [key: string]: SpriteMap }, dimensions: Dimensions) {
        this.stage = stage;
        this.balls = balls;
        this.elementsMap = elementsMap;
        this.mapMaps = mapMaps;
        this.dimensions = dimensions;
    }

    getMapByBall(ball: SpriteBall) {
        return this.mapMaps[`${ball.map.x}_${ball.map.y}`];
    }

    getNearbyBalls(ball: SpriteBall): SpriteBall[] {
        return this.balls.filter(_ball => {
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

    createBall(x: number, y: number, clickBall: Function, color: undefined | string = undefined) {
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

    async moveDown(combinationsBalls: SpriteBall[], clickBall: Function) {
        // проверить 'x' у елемента - найти все элементы с этим 'x'.
        // если их больше одного, найти тот у кого 'y' меньше чем остальные с этими 'x'
        const upLine = [];
        const uniqX = _.uniqBy(combinationsBalls, 'map.x');
        for (const combBall of uniqX) {
            const xballs = combinationsBalls.filter(c => c.map.x === combBall.map.x);
            if (xballs.length > 1) {
                console.log('min Y', _.minBy(xballs, 'map.y')?.map);
                upLine.push({
                    upBall: _.minBy(xballs, 'map.y') as SpriteBall,
                    newCount: xballs.length,
                });

            } else {
                upLine.push({ upBall: combBall, newCount: 1 });
            }
        }

        console.log('upline', upLine);

        const moveBalls: { ball: SpriteBall, mapEl: SpriteMap }[] = [];
        for (const lineComb of upLine) {
            // найдём элементы выше, которые нужно переместить вниз
            const upBalls = this.balls.filter(
                _ball => _ball.map.x === lineComb.upBall.map.x
                    && _ball.map.y < lineComb.upBall.map.y
            );

            upBalls.forEach(_ball => {
                _ball.map.y += lineComb.newCount;
                moveBalls.push({
                    ball: _ball,
                    mapEl: this.getMapByBall(_ball),
                });
            });

            // добавим элементы выше заранее
            for (let i = 1; i <= lineComb.newCount; i += 1) {
                const newBall = this.createBall(
                    lineComb.upBall.x,
                    -(lineComb.upBall.height * (lineComb.newCount - i)) - lineComb.upBall.height,
                    clickBall
                );

                newBall.map = {
                    y: i - 1,
                    x: lineComb.upBall.map.x
                };

                this.balls.push(newBall);
                this.stage.addChild(newBall);

                moveBalls.push({
                    ball: newBall,
                    mapEl: this.getMapByBall(newBall),
                })
            }
        }

        const tickerAnimBalls = new PIXI.Ticker();

        // удалим элементы

        combinationsBalls.forEach(_ball => {
            const index = this.findBallIndex(_ball);
            if (index === -1) {
                console.log('no index remove')
                return;
            }
            _ball.destroy();
            this.balls.splice(index, 1);

            console.log('remove', _ball.name);
        });


        // анимируем движение вышестоящих элементов

        const animSpeed = this.dimensions.element.animation.speed;

        await new Promise((r) => {
            tickerAnimBalls.add(() => {
                moveBalls.forEach(el => {
                    if (el.ball.y < el.mapEl.y) {
                        if (el.ball.y + animSpeed > el.mapEl.y) {
                            el.ball.y = el.mapEl.y;
                        } else {
                            el.ball.y += animSpeed;
                        }
                    }
                });

                let done = true;

                for (const movedBall of moveBalls) {
                    if (movedBall.ball.y !== movedBall.mapEl.y) {
                        done = false;
                        break;
                    }
                }

                if (done) {
                    r(true);
                }

            });

            tickerAnimBalls.start();
        });

        tickerAnimBalls.stop();
        tickerAnimBalls.destroy();

    }

    findBallIndex(ball: SpriteBall) {
        return this.balls.findIndex(_ball => _ball.name === ball.name);
    }

    async swap(ballFrom: SpriteBall, ballTo: SpriteBall) {
        const activeMap = { ...ballFrom.map };
        const targetMap = { ...ballTo.map };

        ballFrom.map = targetMap;
        ballTo.map = activeMap;

        const tickerChangeBalls = new PIXI.Ticker();
        const animationSpeed = 5;

        await new Promise(r => {
            const mapElActive = this.getMapByBall(ballFrom);
            const mapElTarget = this.getMapByBall(ballTo);

            const activeBall = ballFrom;
            const targetBall = ballTo;

            tickerChangeBalls.add(() => {

                const balls = [activeBall, targetBall];
                const maps = [mapElActive, mapElTarget];
                // const pos: [] = ['x','y'];

                for (let i = 0; i <= 1; i += 1) {
                    const _ball = balls[i];
                    const _mapEl = maps[i];

                    if (_ball.x < _mapEl.x) {
                        if (_ball.x + animationSpeed > _mapEl.x) {
                            _ball.x = _mapEl.x;
                        } else {
                            _ball.x += animationSpeed;
                        }
                    }

                    if (_ball.x > _mapEl.x) {
                        if (_ball.x - animationSpeed < _mapEl.x) {
                            _ball.x = _mapEl.x;
                        } else {
                            _ball.x -= animationSpeed;
                        }
                    }

                    if (_ball.y < _mapEl.y) {
                        if (_ball.y + animationSpeed > _mapEl.y) {
                            _ball.y = _mapEl.y;
                        } else {
                            _ball.y += animationSpeed;
                        }
                    }

                    if (_ball.y > _mapEl.y) {
                        if (_ball.y - animationSpeed < _mapEl.y) {
                            _ball.y = _mapEl.y;
                        } else {
                            _ball.y -= animationSpeed;
                        }
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
    }
}

export default Physics;