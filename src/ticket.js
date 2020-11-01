class Ticket {
  constructor(orderNo) {
    this.orderNo = orderNo;
  }
  prepare(value) {
    return new Promise((resolve) => resolve(value));
  }
  done(value) {
    return new Promise((resolve) => resolve(value));
  }
}

export default Ticket;
