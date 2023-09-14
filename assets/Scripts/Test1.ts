import { _decorator, Component, Event, EventTouch, Node } from 'cc';
import { EventCenter } from './event/EventCenter';
import { GameEvent } from './event/GameEvent';
import { event, eventComponent } from './event/event-component';
const { ccclass, property } = _decorator;

@eventComponent
@ccclass('Test1')
export class Test1 extends Component {
    protected onLoad(): void {
        // EventCenter.on(GameEvent.onTableClicked, this.onTableClicked, this);
    }
    
    @event(GameEvent.onTableClicked)
    protected onTableClicked() {
        console.log('this is test1.');
    }
}


