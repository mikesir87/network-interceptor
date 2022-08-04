const { EventEmitter } = require("node:events");

const eventBus = new EventEmitter();

function publishEvent(event) {
  eventBus.emit("event", event);
}

function addListener(listener) {
  eventBus.on("event", listener);
  return () => eventBus.removeListener("event", listener);
}

module.exports = {
  publishEvent,
  addListener,
};