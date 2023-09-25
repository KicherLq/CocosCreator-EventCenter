/**
 * Astar寻路算法
 * f(n) = g(n) + h(n)
 * 相邻两个格子之间的直线距离为10
 * 相邻两个格子之间的对角线距离为14
 * 欧几里得距离：格子与格子之间的直线距离
 * 曼哈顿距离：只准水平和垂直移动下的最短距离
 */

import { _decorator, CCInteger, Color, Component, error, instantiate, Node, Prefab, size, Sprite, UITransform } from 'cc';
import { Grid } from './Grid';
const { ccclass, property } = _decorator;

const FACTOR = 10; //相邻格子的距离
const FACTOR_DIAGNOL = 14; //对角线相邻格子的距离

export enum GRID_TYPE {
    //障碍物
    Obstacle,
    //起点
    Origin,
    //终点
    Destination,
    //普通单元格
    Default,
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

    private __startGrid: Grid = null; //起点
    private __endGrid: Grid = null; //终点
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

    protected start(): void {
        // this.findPath();
    }

    private init() {
        this.initGridMap();
        this.render();
        this.setStartAndEndGrid();
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
                com.getComponent(UITransform).contentSize = size(this.gridSize, this.gridSize);
                grid.prefabGrid = com;
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

    private setGridColor(grid: Grid, color: Color) {
        if(grid.state === GRID_TYPE.Origin || grid.state === GRID_TYPE.Destination) {
            return;
        }
        grid.children[0].getComponent(Sprite).color = color;
    }

    private setStartAndEndGrid() {
        this.__startGrid = this.__gridList[0][0];
        this.addGridToOpenList(this.__startGrid);
        this.__startGrid.state = GRID_TYPE.Origin;
        this.__endGrid = this.__gridList[4][14];
        this.__endGrid.state = GRID_TYPE.Destination;

    }

    public addGridToOpenList(grid: Grid) {
        this.__openList.add(grid);
    }

    private addGridToCloseList(grid: Grid) {
        this.__closeList.add(grid);
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
            neighborGrid.g = newG;
            neighborGrid.gridParent = parentGrid;
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
            console.log(this.__openList);
            //提取排序后的节点
            let minGrid: Grid = this.getMinGridInOpenList();
            //处理该节点相邻的节点
            this.operateNeighborGrid(minGrid);
            //处理完后将该节点加入closeList中
            this.addGridToCloseList(minGrid);
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
            this.setGridColor(grid, Color.YELLOW);
            grid = grid.gridParent;
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
            // return a.f - b.f;
        });
        let minGrid: Grid = tempArray[0];
        this.__openList.delete(minGrid);
        return minGrid;
    }

    private getH(grid: Grid): number {
        if(this.evalutionType === 0) {
            return this.getDiagonalDistance(grid);
        }
        else if(this.evalutionType === 1) {
            return this.getManhattanDistance(grid);
        } else {
            return Math.ceil(this.getEuclideanDistance(grid));
        }
    }

    //对角线距离
    private getDiagonalDistance(grid: Grid): number {
        let x: number = Math.abs(this.__endGrid.col - grid.col);
        let y: number = Math.abs(this.__startGrid.row - grid.row);
        let distance: number = Math.min(x, y) * FACTOR_DIAGNOL + Math.abs(x - y) * FACTOR;
        return distance;
    }
    //曼哈顿距离
    private getManhattanDistance(grid: Grid): number {
        return Math.abs(this.__endGrid.row - grid.row) * FACTOR + Math.abs(this.__endGrid.col - grid.col) * FACTOR;
    }
    //欧几里得距离，貌似有问题
    private getEuclideanDistance(grid: Grid): number {
        let x: number = Math.pow((this.__endGrid.col - grid.col), 2);
        let y: number = Math.pow((this.__endGrid.row - grid.row), 2);
        return Math.sqrt(x + y);
    }
}