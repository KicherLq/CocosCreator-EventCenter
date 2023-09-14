import { Component } from "cc";
import eventsCache, { EventInfo } from "./events-cache";
import eventCenter from "./game-eventcenter";
import { GameEvent } from "./GameEvent";

export function eventComponent(targetClass: typeof Component) {
    //TODO 注意，这里必须使用function而非箭头函数
    targetClass.prototype['addEventListeners'] = function () {
        let events = eventsCache.getAllEvents(this.constructor);
        for (let i = 0; i < events.length; i++) {
            const event = events[i];
            if (!eventCenter.hasEventListener(event.name, event.listener, this)) {
                eventCenter.on(event.name, event.listener, this);
            }
        }
    }

    targetClass.prototype['removeEventListeners'] = function () {
        eventCenter.targetOff(this);
    }

    const originalOnLoad = targetClass.prototype['onLoad'];
    targetClass.prototype['onLoad'] = function () {
        if (this.addEventListeners) {
            this.addEventListeners();
        }

        if (originalOnLoad) {
            originalOnLoad.apply(this);
        }
    }

    const originalOnDestroy = targetClass.prototype['onDestroy'];
    targetClass.prototype['onDestroy'] = function () {
        if (this.removeEventListeners) {
            this.removeEventListeners();
        }

        if (originalOnDestroy) {
            originalOnDestroy.apply(this);
        }
    }
}

/**
 * @param target 被装饰的对象
 * @param propertyKey 被装饰的函数名
 * @param descriptor 被传递过来的属性的描述符
 * @param descriptor.value 被装饰的函数
 */
export function event(event: GameEvent, order = 0) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const func = descriptor && descriptor.value;
        if(typeof(func) !== 'function') {
            throw new Error(`Event listener ${propertyKey} is not a method`);
        }

        eventsCache.cacheEvent(event, target.constructor, func as (...args: any[]) => void, order);
    }
}
