import * as PIXI from 'pixi.js'

export interface SpriteMap extends PIXI.Sprite {
    _color: number;
    _id: string;
    _pX: number;
    _pY: number;
}

export interface SpriteBall extends PIXI.Sprite {
    map: {
        x: number;
        y: number;
    },
    isNeedDraw: boolean,
    color: string,
}

export interface Dimensions {
    element: {
        width: number;
        height: number;
        animation: {
            speed: number;
        }
    }
    levelSize: {
        row: number, // строка
        col: number, // столбец
        spacing: number,
    },
    levelMap: string[][]
}