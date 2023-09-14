import { _decorator, Component, Event, EventTouch, Node } from 'cc';
import { EventCenter } from './event/EventCenter';
import { GameEvent } from './event/GameEvent';
import { event, eventComponent } from './event/event-component';
const { ccclass, property } = _decorator;

@eventComponent
@ccclass('Test2')
export class Test2 extends Component {
    protected onLoad(): void {
        // EventCenter.on(GameEvent.onTableClicked, this.onTableClicked, this);
    }
    
    @event(GameEvent.onTableClicked)
    protected onTableClicked() {
        console.log('this is test2.');
    }
}


