import { _decorator, Component, Label, Node, Prefab } from 'cc';
import { GRID_TYPE } from './AStar';
const { ccclass, property } = _decorator;

export class Grid extends Node {
    private __prefabGrid: Node = null;
    set prefabGrid(prefab: Node) {
        this.__prefabGrid = prefab;
    }
    get prefabGrid() {
        return this.__prefabGrid;
    }

    private __row: number = 0;
    set row(r: number) {
        this.__row = r;
    }
    get row() {
        return this.__row;
    }

    private __col: number = 0;
    set col(c: number) {
        this.__col = c;
    }
    get col() {
        return this.__col;
    }
    constructor(row: number, col: number, state: GRID_TYPE = GRID_TYPE.Default) {
        super();
        this.row = row;
        this.col = col;
        this.state = state;
    }

    //角色到该节点的实际距离
    private __g: number = 0;
    set g(value: number) {
        this.__g = value;
        this.f = this.__g + this.__h;
        this.prefabGrid.getChildByName('G').getComponent(Label).string = `G:${this.__g}`;
    }
    get g() {
        return this.__g;
    }

    //该节点到目的地的估价距离
    private __h: number = 0;
    set h(value: number) {
        this.__h = value;
        this.f = this.__g + this.__h;
        this.prefabGrid.getChildByName('H').getComponent(Label).string = `H:${this.__h}`;
    }
    get h() {
        return this.__h;
    }

    private __f: number = 0;
    set f(value: number) {
        this.__f = value;
        this.prefabGrid.getChildByName('F').getComponent(Label).string = `F:${this.__f}`;
    }
    get f() {
        return this.__f;
    }

    private __state: GRID_TYPE = GRID_TYPE.Default;
    set state(state: GRID_TYPE) {
        this.__state = state;
        
    }
    get state() {
        return this.__state;
    }

    private __gridParent: Grid = null;
    set gridParent(grid: Grid) {
        this.__gridParent = grid;
    }
    get gridParent() {
        return this.__gridParent;
    }
}


