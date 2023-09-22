/**
 * Astar寻路算法
 * f(n) = g(n) + h(n)
 * 相邻两个格子之间的直线距离为10
 * 相邻两个格子之间的对角线距离为14
 * 欧几里得距离：格子与格子之间的直线距离
 * 曼哈顿距离：只准水平和垂直移动下的最短距离
 */

import { _decorator, CCInteger, Component, instantiate, Node, Prefab } from 'cc';
const { ccclass, property } = _decorator;

const FACTOR = 10; //相邻格子的距离
const FACTOR_DIAGNOL = 14; //对角线相邻格子的距离

enum GRID_TYPE {
    //障碍物
    Obstacle,
    //起点
    Origin,
    //终点
    Destination,
    //普通单元格
    Default,
}

class Grid extends Node {
    //角色到该节点的实际距离
    private __g: number = 0;
    set g(value: number) {
        this.__g = value;
        this.__f = this.__g + this.__h;
    }
    get g() {
        return this.__g;
    }

    //该节点到目的地的估价距离
    private __h: number = 0;
    set h(value: number) {
        this.__h = value;
        this.__f = this.__g + this.__h;
    }
    get h() {
        return this.__h;
    }

    private __f: number = 0;
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

@ccclass('AStar')
export class AStar extends Component {
    @property({displayName: '网格地图长度', type: CCInteger})
    mapLength: number = 0;

    @property({displayName: '网格地图宽度', type: CCInteger})
    mapHeight: number = 0;

    @property({displayName: '单元格大小', type: CCInteger})
    gridSize: number = 0;

    @property({displayName: '单元格预制体', type: Prefab})
    gridPrefab: Prefab = null;

    private __openList: Set<Grid> = new Set(); //准备处理的单元格
    private __closeList: Set<Grid> = new Set(); //完成处理的单元格
    private __gridList: Grid[][] = []; //存放所有单元格
    private __gridMap: Node = null;

    protected onLoad(): void {
        this.__openList.clear();
        this.__closeList.clear();
        this.init();
    }

    private init() {
        this.initGridMap();
        this.render();
    }

    private initGridMap() {
        this.__gridMap = this.node.getChildByName('GridMap');
        for(let i = 0; i < this.mapHeight; ++i) {
            this.__gridList[i] = [];
            for(let j = 0; j < this.mapLength; ++j) {
                let grid: Grid = new Grid();
                this.__gridMap.addChild(grid);
                this.__gridList[i].push(grid);
            }
        }
    }

    private render() {
        for(let i = 0; i < this.__gridList.length; ++i) {
            for(let j = 0; j < this.__gridList[i].length; ++j) {
                let grid: Grid = this.__gridList[i][j];
                let com = instantiate(this.gridPrefab);
                com.parent = grid;
                //垃圾cocos连个网格下的layout居中都没有，还TM得自己算坐标
                let startX: number = -this.mapLength / 2 * this.gridSize;
                let startY: number = -this.mapHeight / 2 * this.gridSize;
                let posX: number = startX + j * this.gridSize + j;
                let posY: number = startY + i * this.gridSize + i;
                grid.setPosition(posX, posY);
            }
        }
    }

    public addGridToOpenList(grid: Grid) {
        this.__openList.add(grid);
    }
}