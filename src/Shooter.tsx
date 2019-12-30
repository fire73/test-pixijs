import _ from 'lodash';
import React from 'react';
import './Shooter.css';
import * as PIXI from 'pixi.js';
import { Viewport } from 'pixi-viewport';

interface CustomSprite extends PIXI.Sprite {
  vx: number;
  vy: number;
  deltaX: number;
  deltaY: number;
  pointTo: {
    x: number;
    y: number;
  },
  speed: number;
  wayX: number;
  wayY: number;
}

type Point = {
  x: number;
  y: number;
}

export class Shooter extends React.Component {

  drawLinesBG(canvasW: number, canvasH: number, stage: PIXI.Container) {
    let linesY = 0;
    let linesX = 0;
    let lineStep = 25;

    let line = new PIXI.Graphics();
    line.lineStyle(1, 0xCCCCCC, 1);
    line.moveTo(0, 0);
    line.lineTo(canvasW, 0);
    line.moveTo(0, 0);
    line.lineTo(0, canvasH);
    stage.addChild(line);

    while (linesY < canvasW) {
      linesY += lineStep;
      let line = new PIXI.Graphics();
      line.lineStyle(1, 0xCCCCCC, 1);
      line.moveTo(linesY, 0);
      line.lineTo(linesY, canvasH);
      stage.addChild(line);
    }
    while (linesX < canvasH) {
      linesX += lineStep;
      let line = new PIXI.Graphics();
      line.lineStyle(1, 0xCCCCCC, 1);
      line.moveTo(0, linesX);
      line.lineTo(canvasW, linesX);
      stage.addChild(line);
    }
  }

  componentDidMount() {
    const viewportW = 2000;
    const viewportH = 2000;
    const canvasW = window.innerWidth - 10;
    const canvasH = window.innerHeight - 10;
    // console.log(viewportW, viewportH);
    const canvas = document.getElementById('canvasGame');
    const renderer = new PIXI.Renderer({
      view: canvas as HTMLCanvasElement,
      width: canvasW,
      height: canvasH,
      resolution: window.devicePixelRatio,
      autoDensity: true,
      transparent: true,
    });

    const stage = new Viewport({
      screenWidth: canvasW,
      screenHeight: canvasH,
      worldWidth: viewportW,
      worldHeight: viewportH,

      interaction: renderer.plugins.interaction // the interaction module is important for wheel to work properly when renderer.view is placed or scaled
    });

    // stage
    // .drag()
    // .pinch()
    // .wheel()
    // .decelerate()

    // const stage = new PIXI.Container();
    this.drawLinesBG(viewportW, viewportH, stage);

    const player = PIXI.Sprite.from(`coloredspheres/sphere-01.png`) as CustomSprite;
    player.vx = 0;
    player.vy = 0;
    player.speed = 1.5;

    stage.x = 0;
    stage.y = 0;

    stage.follow(player, {
      speed: 5,
      radius: 120
    });

    let bullets: CustomSprite[] = [];

    // const countEnemies = 3;
    let enemies: CustomSprite[] = [];
    // for (let i = 0; i < countEnemies; i += 1) {
    //   createEnemy()
    // }
    function createEnemy() {
      const enemy = PIXI.Sprite.from(`coloredspheres/sphere-11.png`) as CustomSprite;
      enemy.anchor.set(0.5, 0.5);
      enemy.width = 50;
      enemy.height = 50;
      const direction = _.random(3);
      if (direction === 0) {
        enemy.x = 0;
        enemy.y = _.random(viewportH);
      }
      if (direction === 1) {
        enemy.x = viewportW;
        enemy.y = _.random(viewportH);
      }
      if (direction === 2) {
        enemy.y = 0;
        enemy.x = _.random(viewportW);
      }
      if (direction === 3) {
        enemy.y = viewportH;
        enemy.x = _.random(viewportW);
      }
      enemy.speed = 0.5 + _.random(1);
      let angle = Math.atan2(enemy.y - player.y, enemy.x - player.x) / Math.PI * 180;
      angle += 90;
      enemy.vx = Math.sin(angle * (Math.PI / - 180)) * enemy.speed;
      enemy.vy = Math.cos(angle * (Math.PI / - 180)) * enemy.speed;
      // enemy.deltaX = 0.02;
      // enemy.deltaY = 0.02;
      enemies.push(enemy);
      stage.addChild(enemy);
    }

    // createEnemy();
    // setInterval(() => {
    //   createEnemy();
    // }, 5000);

    setInterval(() => {
      enemies.forEach((enemy) => {
        let angle = Math.atan2(enemy.y - player.y, enemy.x - player.x) / Math.PI * 180;
        angle += 90;
        enemy.vx = Math.sin(angle * (Math.PI / - 180)) * enemy.speed;
        enemy.vy = Math.cos(angle * (Math.PI / - 180)) * enemy.speed;
      });
    }, 2000);

    renderer.plugins.interaction.on('pointerup', (event: any) => {
      // console.log(event.data.global.x.toFixed(2), event.data.global.y.toFixed(2), {
      //   pX: player.x,
      //   pY: player.y
      // }, {
      //   sX: stage.x,
      //   sY: stage.y
      // });
      const clX = event.data.global.x - stage.x;
      const clY = event.data.global.y - stage.y;
      const bullet = PIXI.Sprite.from(`coloredspheres/sphere-02.png`) as CustomSprite;
      bullet.anchor.set(0.5, 0.5);
      bullet.x = player.x;
      bullet.y = player.y;
      bullet.width = 10;
      bullet.height = 10;
      bullet.deltaX = 0.5;
      bullet.deltaY = 0.5;
      bullet.pointTo = {
        x: clX,
        y: clY
      }
      let angle = Math.atan2(bullet.y - bullet.pointTo.y, bullet.x - bullet.pointTo.x) / Math.PI * 180;
      angle += 90;
      bullet.speed = 4;

      bullet.vx = Math.sin(angle * (Math.PI / - 180)) * bullet.speed;
      bullet.vy = Math.cos(angle * (Math.PI / - 180)) * bullet.speed;

      stage.addChild(bullet);
      bullets.push(bullet);
    });

    window.addEventListener(
      "keydown", (event) => {
        if (event.key === 'ArrowUp' || event.keyCode === 87) {
          player.vy = -player.speed;
          event.preventDefault();
        }
        if (event.key === 'ArrowDown' || event.keyCode === 83) {
          player.vy = player.speed;
          event.preventDefault();
        }
        if (event.key === 'ArrowLeft' || event.keyCode === 65) {
          player.vx = -player.speed;
          event.preventDefault();
        }
        if (event.key === 'ArrowRight' || event.keyCode === 68) {
          player.vx = player.speed;
          event.preventDefault();
        }
        // if (event.keyCode === 32) {
        //   console.log('PIFF PAF',
        //   {
        //     x: player.x,
        //     y: player.y,
        //     width: player.width,
        //     height: player.height
        //   });


        //   event.preventDefault();
        // }
      }, false
    );
    window.addEventListener(
      "keyup", (event) => {
        if (event.key === 'ArrowUp' || event.keyCode === 87) {
          player.vy = 0;
          event.preventDefault();
        }
        if (event.key === 'ArrowDown' || event.keyCode === 83) {
          player.vy = 0;
          event.preventDefault();
        }
        if (event.key === 'ArrowLeft' || event.keyCode === 65) {
          player.vx = 0;
          event.preventDefault();
        }
        if (event.key === 'ArrowRight' || event.keyCode === 68) {
          player.vx = 0;
          event.preventDefault();
        }
      }, false
    );

    player.anchor.set(0.5, 0.5);

    player.width = 30;
    player.height = 30;
    player.x = 200;
    player.y = 200;
    player.rotation = 3;

    stage.addChild(player);

    const ticker = new PIXI.Ticker();
    ticker.add(() => {
      renderer.render(stage);
      player.rotation += 0.05;
      if (player.y - player.height / 2 >= 0 && player.y + player.height / 2 <= viewportH
        && player.x - player.width / 2 >= 0 && player.x + player.width / 2 <= viewportW) {
        player.y += player.vy;
        player.x += player.vx;
        if (player.y - player.height / 2 < 0) {
          player.y = player.height / 2;
        }
        if (player.x - player.width / 2 < 0) {
          player.x = player.width / 2;
        }
        if (player.y + player.height / 2 > viewportH) {
          player.y = viewportH - player.height / 2;
        }
        if (player.x + player.width / 2 > viewportW) {
          player.x = viewportW - player.width / 2;
        }
      }
      // delta += 0.05;
      // player.scale.set(0.2 + Math.sin(delta) / 10)
      bullets.forEach((bull, key) => {
        // bull.y += 3;
        // bull.deltaX += 0.2;
        // bull.deltaY += 0.2;
        // bull.x += Math.sin(bull.deltaX) * 5;
        // bull.y += Math.cos(bull.deltaY) * 5;

        bull.x += bull.vx;
        bull.y += bull.vy;
        if (bull.y > viewportH || bull.y < 0 || bull.x < 0 || bull.x > viewportW) {
          stage.removeChild(bull);
          bullets.splice(key, 1);
        }

        enemies.forEach((enemy, keyEnemy) => {
          if (
            bull.y + bull.height / 2 >= enemy.y - enemy.height / 2
            && bull.y - bull.height / 2 <= enemy.y + enemy.height / 2
            && bull.x + bull.width / 2 >= enemy.x - enemy.width / 2
            && bull.x - bull.width / 2 <= enemy.x + enemy.width / 2
          ) {
            // console.log('COLLIDE');
            stage.removeChild(bull);
            bullets.splice(key, 1);
            stage.removeChild(enemy);
            enemies.splice(keyEnemy, 1);
          }
        });

      });

      // enemies.forEach((enemy, key) => {
      //   // enemy
      //   enemy.deltaX += 0.05;
      //   enemy.deltaY += 0.05;
      //   enemy.x += Math.sin(enemy.deltaX) * 2;
      //   enemy.y += Math.cos(enemy.deltaY) * 2;
      //   enemy.x += enemy.speed;
      //   enemy.y += enemy.speed;

      //   if (enemy.x > canvasH) {
      //     stage.removeChild(enemy);
      //     enemies.splice(key, 1);
      //   }
      // });
      enemies.forEach((enemy, key) => {
        enemy.x += enemy.vx;
        enemy.y += enemy.vy;
      });
    });
    ticker.start();
  }

  render() {
    return <div className="Shooter">
      <canvas id="canvasGame"></canvas>
    </div>
  }
}