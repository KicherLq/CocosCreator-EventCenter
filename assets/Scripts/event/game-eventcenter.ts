import { Eventify } from './eventify';

class Empty {}
// class EventTarget extends Eventify(Empty) {

// }
const EventTarget = Eventify(Empty);
export { EventTarget};
let eventCenter = new EventTarget();
export default eventCenter;