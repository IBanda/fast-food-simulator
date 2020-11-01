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
let arrivalInterval = document.querySelector('.arrival-interval');
let fulfilmentInterval = document.querySelector('.fulfilment-interval');
let createTicketInterval = document.querySelector('.ticket-creation-interval');
let serveInterval = document.querySelector('.serve-interval');
let simulationDuration = document.querySelector('.duration');
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
let arrivalIntervalValue;
let fulfilmentIntervalValue;
let ticketCreationInterval;
let serveIntervalValue;
let duration;
let isRunning = { running: null };

function start() {
  setSimulationState.bind(controlButton)();
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
function takeNextOrder() {
  if (orderLine.isEmpty()) return;
  createOrder(orderLine.remove());
  waitingCustomers.textContent = orderLine.size();
}

function createCustomers() {
  if (paidCustomerWaitingQueue.isEmpty() && !isFirstCustomer) {
    let customer = new Customer();
    checkOrderLine(customer);

    isFirstCustomer = true;
    createCustomers();
  } else {
    let interval = setInterval(() => {
      let customer = new Customer();
      if (!isRunning.running) {
        return clearInterval(interval);
      }
      checkOrderLine(customer);
    }, arrivalIntervalValue);
  }
}

function createOrder(customer) {
  orderInProgress = true;
  let ticketNo = generateUUID();
  currentOrder.textContent = ticketNo;
  simulateAction(
    orderTaker.createTicket(ticketNo),
    ticketCreationInterval,
    isRunning
  )
    .then((ticket) => {
      customer.ticketNo = ticket.orderNo;
      paidCustomerWaitingQueue.add(customer);
      customersInServiceLine.textContent = paidCustomerWaitingQueue.size();
      orderInProgress = false;
      currentOrder.textContent = '-';
      kitchenQueue.add(ticket);
    })
    .then(() => {
      takeNextOrder();
      prepare();
    });
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
    simulateAction(
      currentTicket.prepare(order),
      fulfilmentIntervalValue,
      isRunning
    )
      .then((order) => {
        serviceQueue.add({ order, done: currentTicket.done });
      })
      .then(() => {
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
    simulateAction(readyOrder.done(), serveIntervalValue, isRunning).then(
      () => {
        paidCustomerWaitingQueue.remove();
        customersInServiceLine.textContent = paidCustomerWaitingQueue.size();
        isAvailableForPickup = false;
        if (!serviceQueue.isEmpty()) service();
        readyPickup.textContent = '-';
      }
    );
  } else {
    customersInServiceLine.textContent = paidCustomerWaitingQueue.size();
  }
}

function setSimulationState() {
  let { running } = isRunning;
  if (running === false) {
    window.location.reload();
  }
  isRunning.running = running ? false : true;
  this.textContent = isRunning.running ? 'Stop' : 'Reset';
  getStartUpValues();
}

function getStartUpValues() {
  arrivalIntervalValue = convertToMilliseconds(arrivalInterval.value);
  fulfilmentIntervalValue = convertToMilliseconds(fulfilmentInterval.value);
  ticketCreationInterval = convertToMilliseconds(createTicketInterval.value);
  serveIntervalValue = convertToMilliseconds(serveInterval.value);
  duration = convertToMilliseconds(simulationDuration.value);
  if (
    arrivalIntervalValue < 0 ||
    fulfilmentInterval < 0 ||
    ticketCreationInterval < 0 ||
    serveIntervalValue < 0 ||
    duration < 0
  ) {
    return alert('Intervals should be greater than or equal to zero');
  }
  if (duration) {
    setSimulationDuration(duration);
  }

  createCustomers();
}

function setSimulationDuration(duration) {
  simulateAction(null, duration, isRunning).then(() => start());
}

controlButton.onclick = start;
window.onerror = function () {
  console.log('Simulation Stopped');
};
