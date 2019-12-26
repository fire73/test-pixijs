// import _ from 'lodash';
import React from 'react';
import './Shooter.css';
import * as PIXI from 'pixi.js'

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

    const player = PIXI.Sprite.from(`coloredspheres/sphere-01.png`);



    // player.pivot.set(25, 25);
    // console.log(player.width, player.height);
    player.anchor.set(0.5, 0.5);

    player.width = 50;
    player.height = 50;
    player.x = 25;
    player.y = 25;
    // player.pivot.x = player.width / 2;
    // player.pivot.y = player.height / 2;
    // player.angle = 25;
    player.rotation = 3;

    stage.addChild(player);

    const ticker = new PIXI.Ticker();
    // let delta = 0.1;
    ticker.add(() => {
      renderer.render(stage);
      player.rotation += 0.05;
      // delta += 0.05;
      // player.scale.set(0.2 + Math.sin(delta) / 10)
    });
    ticker.start();
  }

  render() {
    return <div className="Shooter">
      <canvas id="canvasGame"></canvas>
    </div>
  }
}