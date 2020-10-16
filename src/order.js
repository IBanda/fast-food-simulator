let foods = ['chicken', 'burger', 'fries', 'ice cream', 'prawns', 'beef'];
class Order {
  constructor(orderNo) {
    this.orderNo = orderNo;
    this.order = foods[Math.floor(Math.random() * 6)];
  }
}

export default Order;
