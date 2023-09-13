import { Eventify } from "cc";


class Empty {};
//空类作为基类进行继承，避免装箱拆箱
const EventTarget = Eventify(Empty);
export { EventTarget };
let eventCenter = new EventTarget();
export default eventCenter;