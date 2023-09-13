import { _decorator, Component, Event, EventTouch, Node } from 'cc';
import { EventCenter } from './event/EventCenter';
import { GameEvent } from './event/GameEvent';
const { ccclass, property } = _decorator;

@ccclass('Test2')
export class Test2 extends Component {
    protected onLoad(): void {
        EventCenter.on(GameEvent.onTableClicked, this.onTableClicked, this);
    }
    
    protected onTableClicked() {
        console.log('this is test2.');
    }
}


