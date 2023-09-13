import { _decorator, Component, Event, EventTouch, Node } from 'cc';
import { EventCenter } from './event/EventCenter';
import { GameEvent } from './event/GameEvent';
const { ccclass, property } = _decorator;

@ccclass('Test1')
export class Test1 extends Component {
    protected onLoad(): void {
        EventCenter.on(GameEvent.onTableClicked, this.onTableClicked, this);
    }
    
    protected onTableClicked() {
        console.log('this is test1.');
    }
}


