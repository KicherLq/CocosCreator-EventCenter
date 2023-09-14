import { _decorator, Component, Event, EventTouch, Node } from 'cc';
import { EventCenter } from './event/EventCenter';
import { GameEvent } from './event/GameEvent';
import eventCenter from './event/game-eventcenter';
const { ccclass, property } = _decorator;

@ccclass('Game')
export class Game extends Component {
    protected onLoad(): void {
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
    }

    protected onDestroy(): void {
        this.node.off(Node.EventType.TOUCH_START);
    }
    
    protected onTouchStart(event: EventTouch) {
        // EventCenter.emit(GameEvent.onTableClicked);
        eventCenter.emit(GameEvent.onTableClicked);
    }

}


