import convertToMilliseconds from '../utils/convertToMilliseconds.js';
class Ticket {
  constructor(interval, orderNo) {
    this.timeInterval = convertToMilliseconds(interval);
    this.orderNo = orderNo;
  }
  prepare(value) {
    return new Promise((resolve) =>
      setTimeout(() => resolve(value), this.timeInterval)
    );
  }
  done(value) {
    return new Promise((resolve) => setTimeout(() => resolve(value), 2000));
  }
}

export default Ticket;
