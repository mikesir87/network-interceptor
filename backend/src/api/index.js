const express = require("express");
const { getContainers, getPortsForContainer } = require("./docker");

const router = express.Router();

router.get("/containers", getContainers);
router.get("/containers/:containerId/ports", getPortsForContainer);

module.exports = {
  router,
};