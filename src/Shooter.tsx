// import _ from 'lodash';
import React from 'react';
import './Shooter.css';
import * as PIXI from 'pixi.js';

interface CustomSprite extends PIXI.Sprite {
  vx: number;
  vy: number;
  deltaX: number;
}

export class Shooter extends React.Component {

  componentDidMount() {
    const canvasW = 600;
    const canvasH = 600;
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

    const player = PIXI.Sprite.from(`coloredspheres/sphere-01.png`) as CustomSprite;
    player.vx = 0;
    player.vy = 0;
    let speedRun = 5;

    let bullets: CustomSprite[] = [];

    // window.addEventListener()

    renderer.plugins.interaction.on('pointerup', (event: any) => {
      console.log(event.data.global.x.toFixed(2), event.data.global.y.toFixed(2));
      const bullet = PIXI.Sprite.from(`coloredspheres/sphere-02.png`) as CustomSprite;
      bullet.x = player.x;
      bullet.y = player.y;
      bullet.width = 10;
      bullet.height = 10;
      bullet.deltaX = 0.1;
      bullet.anchor.set(0.5, 0.5);
      stage.addChild(bullet);
      bullets.push(bullet);
    });

    window.addEventListener(
      "keydown", (event) => {
        // console.log(event.keyCode);
        if (event.key === 'ArrowUp') {
          player.vy = -speedRun;
          event.preventDefault();
        }
        if (event.key === 'ArrowDown') {
          player.vy = speedRun;
          event.preventDefault();
        }
        if (event.key === 'ArrowLeft') {
          player.vx = -speedRun;
          event.preventDefault();
        }
        if (event.key === 'ArrowRight') {
          player.vx = speedRun;
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

    // console.log(player.width, player.height);
    player.anchor.set(0.5, 0.5);
    // player.pivot.set(0.5, 0.5);

    player.width = 50;
    player.height = 50;
    player.x = 200;
    player.y = 200;
    // player.pivot.x = player.width / 2;
    // player.pivot.y = player.height / 2;
    // player.angle = 25;
    player.rotation = 3;
    // player.vx = 

    stage.addChild(player);

    const ticker = new PIXI.Ticker();
    // let delta = 0.1;
    ticker.add(() => {
      renderer.render(stage);
      player.rotation += 0.05;
      player.y += player.vy;
      player.x += player.vx;
      // delta += 0.05;
      // player.scale.set(0.2 + Math.sin(delta) / 10)
      bullets.forEach((bull, key) => {
        // bull.y += 3;
        bull.deltaX += 0.2;
        // bull.x += Math.sin(bull.deltaX) * 5;
        bull.y -= Math.sin(bull.deltaX) * 5;
        bull.y -= 3;
        bull.x += 3;
        if (bull.y > canvasH-50) {
          stage.removeChild(bull);
          bullets.splice(key, 1);
        }
        if (bull.y < 50) {
          stage.removeChild(bull);
          bullets.splice(key, 1);
        }
      })
    });
    ticker.start();
  }

  render() {
    return <div className="Shooter">
      <canvas id="canvasGame"></canvas>
    </div>
  }
}