class Queue {
  constructor(array) {
    this.queue = array || [];
  }
  add(value) {
    this.queue.push(value);
  }
  remove() {
    return this.queue.shift();
  }
  access(n) {
    let bufferArray = this.queue.slice();
    if (n <= 0) throw Error('Invalid node');
    let bufferQueue = new Queue(bufferArray);
    while (--n !== 0) {
      bufferQueue.remove();
    }
    return bufferQueue.remove();
  }
  isEmpty() {
    return this.queue.length == 0;
  }
  size() {
    return this.queue.length;
  }
}

export default Queue;
