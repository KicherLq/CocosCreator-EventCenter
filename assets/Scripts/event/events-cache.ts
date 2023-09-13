import { GameEvent } from "./GameEvent";

export interface EventInfo {
    order: number,
    constructor: Function,
    name: GameEvent,
    listener: (...args: any[]) => void
}

export class EventCache {
    private __events: EventInfo[] = [];

    public cacheEvent(name: GameEvent, constructor: Function, listener: (...args: any[]) => void, order = 0) {
        let newEvent: EventInfo = { order, constructor, listener, name };
        this.__events.push(newEvent);
        this.__events.sort((a: EventInfo, b: EventInfo) => {
            return b.order - a.order;
        });
    }

    public getAllEvents(constructor: Function) {
        let array: EventInfo[] = [];
        for(let i = 0; i < this.__events.length; ++i) {
            const e = this.__events[i];
            if(e.constructor === constructor) {
                array.push(e);
            }
        }
        return array;
    }

}

let eventsCache = new EventCache();
export default eventsCache;