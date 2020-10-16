import Queue from './src/queue.js';
import OrderTaker from './src/orderTaker.js';
import Customer from './src/customer.js';
import convertToMilliseconds from './utils/convertToMilliseconds.js';
import generateUUID from './utils/generateUUID.js';
import Order from './src/order.js';
import simulateAction from './utils/simulateAction.js';

let kitchenQueue = new Queue();
let paidCustomerWaitingQueue = new Queue();
let orderLine = new Queue();
let serviceQueue = new Queue();

let orderTaker = new OrderTaker();
let arrivalInterval = document.querySelector('.customer-arrival');
let fulfilmentInterval = document.querySelector('.order-fulfilment');
let controlButton = document.querySelector('.control-btn');
let waitingCustomers = document.querySelector('.waiting-customers');
let currentOrder = document.querySelector('.current-order');
let orderBeingPrepared = document.querySelector('.order-being-prepared');
let totalWaitingOrders = document.querySelector('.total-waiting-orders');
let waitingOrdersList = document.querySelector('.waiting-orders-list');
let readyPickup = document.querySelector('.ready-pickup');
let customersInServiceLine = document.querySelector('.total-waiting-cus');
let orderInProgress = false;
let isFirstCustomer = false;
let arrivalValue;
let isRunning;
let fulfilmentValue;

function start() {
  isRunning = isRunning ? false : true;
  this.textContent = isRunning ? 'Stop' : 'Start';
  arrivalValue = arrivalInterval.value;
  fulfilmentValue = fulfilmentInterval.value;
  arrivalInterval.value = 0;
  fulfilmentInterval.value = 0;
  createCustomers();
}

function checkOrderLine(customer) {
  let count;
  if (orderInProgress || !orderLine.isEmpty()) {
    orderLine.add(customer);
    count = orderLine.size();
  } else {
    createOrder(customer);
  }
  waitingCustomers.textContent = count ? count : 0;
}

function createCustomers() {
  // let count = 1;
  if (paidCustomerWaitingQueue.isEmpty() && !isFirstCustomer) {
    let customer = new Customer();
    checkOrderLine(customer);
    isFirstCustomer = true;
    createCustomers();
    // count++;
  } else {
    let interval = setInterval(() => {
      let customer = new Customer();
      if (!isRunning) {
        return clearInterval(interval);
      }
      //Clear the Interval
      checkOrderLine(customer);
      // count++;
    }, convertToMilliseconds(arrivalValue));
  }
}

function createOrder(customer) {
  orderInProgress = true;
  let ticketNo = generateUUID();
  currentOrder.textContent = ticketNo;
  // simulateAction(orderTaker.createTicket())
  new Promise((resolve) => {
    let timeout = setTimeout(() => {
      if (!isRunning) {
        throw Error('Stopped Game');
      }
      resolve(orderTaker.createTicket(fulfilmentValue, ticketNo));
    }, 5000);
    //Clear Timeout
    return timeout;
  })
    .then((ticket) => {
      customer.ticketNo = ticket.orderNo;
      paidCustomerWaitingQueue.add(customer);
      customersInServiceLine.textContent = paidCustomerWaitingQueue.size();
      orderInProgress = false;
      currentOrder.textContent = '-';
      kitchenQueue.add(ticket);
    })
    .then(() => {
      //check if running
      takeNextOrder();
      prepare();
    });
}

function takeNextOrder() {
  if (orderLine.isEmpty()) return;
  createOrder(orderLine.remove());
  waitingCustomers.textContent = orderLine.size();
}
let isStillPreparing;
let addedToWaitingList = [];
function prepare() {
  if (!isStillPreparing) {
    let currentTicket = kitchenQueue.remove();
    isStillPreparing = true;
    totalWaitingOrders.textContent = kitchenQueue.size();
    orderBeingPrepared.textContent = currentTicket.orderNo;
    let order = new Order(currentTicket.orderNo);
    new Promise((resolve) => {
      resolve(currentTicket.prepare(order));
    })
      .then((order) => {
        serviceQueue.add({ order, done: currentTicket.done });
      })
      .finally(() => {
        isStillPreparing = false;
        if (addedToWaitingList.length) removeFromWaitingList();
        orderBeingPrepared.textContent = '-';
        if (!kitchenQueue.isEmpty()) prepare();
        service();
      });
  } else {
    let kitcheQueueSize = kitchenQueue.size();
    totalWaitingOrders.textContent = kitcheQueueSize;
    addToWaitiingList(kitcheQueueSize);
  }
}
function addToWaitiingList(n) {
  let ticket = document.createElement('li');
  ticket.innerHTML = kitchenQueue.access(n).orderNo;
  waitingOrdersList.appendChild(ticket);
  addedToWaitingList.push(ticket);
}
function removeFromWaitingList() {
  waitingOrdersList.removeChild(addedToWaitingList.shift());
}
let isAvailableForPickup;
function service() {
  if (!isAvailableForPickup) {
    let readyOrder = serviceQueue.remove();
    let {
      order: { orderNo },
    } = readyOrder;
    readyPickup.textContent = orderNo;
    isAvailableForPickup = true;
    // simulateAction(readyOrder.done(),)
    new Promise((resolve) => {
      resolve(readyOrder.done());
    })
      .then(() => {
        let x = paidCustomerWaitingQueue.remove();
        console.log(x.ticketNo);
        customersInServiceLine.textContent = paidCustomerWaitingQueue.size();
        isAvailableForPickup = false;
        if (!serviceQueue.isEmpty()) service();
      })
      .finally(() => {
        readyPickup.textContent = '-';
      });
  } else {
    customersInServiceLine.textContent = paidCustomerWaitingQueue.size();
  }
}
controlButton.onclick = start;
