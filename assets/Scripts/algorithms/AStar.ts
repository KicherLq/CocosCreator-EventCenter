/**
 * Astar寻路算法
 * f(n) = g(n) + h(n)
 * 相邻两个格子之间的直线距离为10
 * 相邻两个格子之间的对角线距离为14
 * 欧几里得距离：格子与格子之间的直线距离
 * 曼哈顿距离：只准水平和垂直移动下的最短距离
 */

import { _decorator, CCInteger, Component, error, instantiate, Node, Prefab } from 'cc';
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
    constructor(row: number, col: number) {
        super();
        this.__row = row;
        this.__col = col;
    }

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

    @property({displayName: '估价方式', type: CCInteger})
    evalutionType: number = 0;

    private __openList: Set<Grid> = new Set(); //准备处理的单元格
    private __closeList: Set<Grid> = new Set(); //完成处理的单元格
    private __gridList: Grid[][] = []; //存放所有单元格
    private __gridMap: Node = null;
    private __destinationGrid: Grid = null;

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
                let grid: Grid = new Grid(i, j);
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

    public addNeighborGridToOpenList(parentGrid: Grid, neighborGrid: Grid, g: number) {
        //当前节点的实际距离g等于上个节点的实际距离加上自己到上个节点的实际距离
        let newG: number = parentGrid.g + g;
        //如果该位置的节点已经在openList中
        if(this.__openList.has(neighborGrid)) {
            //比较实际距离g的值，用更小的值替换
            if(newG < neighborGrid.g) {
                neighborGrid.g = newG;
                neighborGrid.gridParent = parentGrid;
            }
        } else {
            neighborGrid.h = this.getH(neighborGrid);
            //如果周边有一个是终点，那么说明已经找到了
            if(neighborGrid.state === GRID_TYPE.Destination) {
                this.__destinationGrid = neighborGrid;
            } else {
                this.addGridToOpenList(neighborGrid);
            }
        }
    }

    //处理相邻的节点
    private operateNeighborGrid(grid: Grid) {
        for (let i = -1; i <= 1; ++i) {
            for (let j = -1; j <= 1; ++j) {
                if (i === 0 && j === 0) {
                    continue;
                }
                let newRow: number = grid.row + i;
                let newCol: number = grid.col + j;
                //超出地图范围
                if(newRow < 0 || newRow >= this.mapHeight || newCol < 0 || newCol >= this.mapLength) {
                    continue;
                }
                let newGrid: Grid = this.__gridList[newRow][newCol];
                //已经处理过的节点
                if(this.__closeList.has(newGrid)) {
                    continue;
                }
                //障碍物节点
                if(newGrid.state === GRID_TYPE.Obstacle) {
                    continue;
                }
                //将相邻节点加入openList中
                if(i === 0 || j === 0) {
                    this.addNeighborGridToOpenList(grid, newGrid, FACTOR);
                } else{
                    this.addNeighborGridToOpenList(grid, newGrid, FACTOR_DIAGNOL);
                }
            }
        }
    }

    //计算寻路
    public findPath() {
        while(this.__openList.size > 0 ) {
            //提取排序后的节点
            let minGrid: Grid = this.getMinGridInOpenList();
            //处理该节点相邻的节点
            this.operateNeighborGrid(minGrid);
            //处理完后将该节点加入closeList中
            this.addGridToOpenList(minGrid);
        }
        if(this.__destinationGrid === null) {
            error('找不到可用路径')
        } else{
            this.showPath();
        }
    }

    private showPath() {
        let grid: Grid = this.__destinationGrid;
        while(grid !== null) {
            
        }
    }

    private getMinGridInOpenList() {
        if(this.__openList.size <= 0) {
            return undefined;
        }
        let tempArray: Grid[] = [];
        for(const grid of this.__openList) {
            tempArray.push(grid);
        }
        //先按照f的值进行升序排序，再按照h的值进行升序排序
        tempArray.sort((a: Grid, b: Grid) => {
            return a.f === b.f ? a.h - b.h : a.f - b.f;
        });
        let minGrid: Grid = tempArray[0];
        this.__openList.delete(minGrid);
        return minGrid;
    }

    private getH(grid: Grid): number {
        if(this.evalutionType === 0) {

        }
        else if(this.evalutionType === 1) {

        } else {

        }
    }

    //曼哈顿距离
    private getDiagonalDistance(grid: Grid): number {

    }
    //对角线距离
    private getManhattanDistance(grid: Grid): number {

    }
    //欧几里得距离，貌似有问题
    private getEuclideanDistance(grid: Grid): number {

    }
}