import Ticket from './ticket.js';

class OrderTaker {
  constructor() {
    this.ticketNo = null;
  }
  createTicket(interval, ticketNo) {
    this.ticketNo = ticketNo;
    let ticket = new Ticket(interval, this.ticketNo);
    return ticket;
  }
}

export default OrderTaker;
