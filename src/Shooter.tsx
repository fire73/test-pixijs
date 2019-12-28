import _ from 'lodash';
import React from 'react';
import './Shooter.css';
import * as PIXI from 'pixi.js';

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
    const canvasW = 700;
    const canvasH = 700;
    const canvas = document.getElementById('canvasGame');
    const renderer = new PIXI.Renderer({
      view: canvas as HTMLCanvasElement,
      width: canvasW,
      height: canvasH,
      resolution: window.devicePixelRatio,
      autoDensity: true,
      transparent: true,
    });

    const stage = new PIXI.Container();
    this.drawLinesBG(canvasW, canvasH, stage);

    const player = PIXI.Sprite.from(`coloredspheres/sphere-01.png`) as CustomSprite;
    player.vx = 0;
    player.vy = 0;
    player.speed = 2;

    let bullets: CustomSprite[] = [];

    const countEnemies = 3;
    let enemies: CustomSprite[] = [];
    // for (let i = 0; i < countEnemies; i += 1) {
    //   createEnemy()
    // }
    function createEnemy() {
      const enemy = PIXI.Sprite.from(`coloredspheres/sphere-11.png`) as CustomSprite;
      enemy.anchor.set(0.5, 0.5);
      enemy.width = 50;
      enemy.height = 50;
      enemy.x = 0;
      enemy.y = 0;
      enemy.speed = 0.5;
      enemy.deltaX = 0.02;
      enemy.deltaY = 0.02;
      enemies.push(enemy);
      stage.addChild(enemy);
    }

    createEnemy();
    setInterval(() => {
      createEnemy();
    }, 5000);

    renderer.plugins.interaction.on('pointerup', (event: any) => {
      console.log(event.data.global.x.toFixed(2), event.data.global.y.toFixed(2), {
        pX: player.x,
        pY: player.y
      });
      const clX = event.data.global.x;
      const clY = event.data.global.y;
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
      // angle = (angle < 0) ? angle + 360 : angle;
      angle += 90;
      console.log('angle', angle);

      bullet.speed = 2;

      bullet.vx = Math.sin(angle * (Math.PI / - 180)) * bullet.speed;
      bullet.vy = Math.cos(angle * (Math.PI / - 180)) * bullet.speed;

      stage.addChild(bullet);
      bullets.push(bullet);
    });

    window.addEventListener(
      "keydown", (event) => {
        // console.log(event.keyCode);
        if (event.key === 'ArrowUp') {
          player.vy = -player.speed;
          event.preventDefault();
        }
        if (event.key === 'ArrowDown') {
          player.vy = player.speed;
          event.preventDefault();
        }
        if (event.key === 'ArrowLeft') {
          player.vx = -player.speed;
          event.preventDefault();
        }
        if (event.key === 'ArrowRight') {
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
        if (event.key === 'ArrowUp') {
          player.vy = 0;
          event.preventDefault();
        }
        if (event.key === 'ArrowDown') {
          player.vy = 0;
          event.preventDefault();
        }
        if (event.key === 'ArrowLeft') {
          player.vx = 0;
          event.preventDefault();
        }
        if (event.key === 'ArrowRight') {
          player.vx = 0;
          event.preventDefault();
        }
      }, false
    );

    player.anchor.set(0.5, 0.5);

    player.width = 50;
    player.height = 50;
    player.x = 200;
    player.y = 200;
    player.rotation = 3;

    stage.addChild(player);

    const ticker = new PIXI.Ticker();
    ticker.add(() => {
      renderer.render(stage);
      player.rotation += 0.05;
      player.y += player.vy;
      player.x += player.vx;
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
        if (bull.y > canvasH - 50 || bull.y < 50 || bull.x < 50 || bull.x > canvasW - 50) {
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

      enemies.forEach((enemy, key) => {
        // enemy
        enemy.deltaX += 0.05;
        enemy.deltaY += 0.05;
        enemy.x += Math.sin(enemy.deltaX) * 2;
        enemy.y += Math.cos(enemy.deltaY) * 2;
        enemy.x += enemy.speed;
        enemy.y += enemy.speed;

        if (enemy.x > canvasH) {
          stage.removeChild(enemy);
          enemies.splice(key, 1);
        }
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