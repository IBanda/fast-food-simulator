import Ticket from './ticket.js';

class OrderTaker {
  constructor() {
    this.ticketNo = null;
  }
  createTicket(ticketNo) {
    this.ticketNo = ticketNo;
    let ticket = new Ticket(this.ticketNo);
    return ticket;
  }
}

export default OrderTaker;
