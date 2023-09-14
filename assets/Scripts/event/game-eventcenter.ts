import { Eventify } from './eventify';

//空类作为基类进行继承，避免装箱拆箱
class Empty {}
// class EventTarget extends Eventify(Empty) {

// }
const EventTarget = Eventify(Empty);
export { EventTarget};
let eventCenter = new EventTarget();
export default eventCenter;