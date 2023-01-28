const Docker = require("dockerode");
const stream = require('stream');

const docker = new Docker();

function handleWebsocket(ws, req) {
  let stopHandlers = {};

  docker.listContainers({
    filters: '{"label": ["io.mikesir87/purpose=tcpdump-websocket"]}'
  }).then((containers) => {
    return Promise.all(
      containers.map(c => docker.getContainer(c.Id))
    );
  }).then((containers) => {
    containers.forEach(c => c.kill());
  });

  ws.on("message", (rawData) => {
    const { type, containerId, port } = JSON.parse(rawData);
    if (type === "START_CAPTURE") {
      stopHandlers[`${containerId}:${port}`] = startDump(
        containerId, 
        port,
        (msg) => ws.send(JSON.stringify({ type: "MESSAGE", message: msg, containerId, port })),
        (err) => ws.send(JSON.stringify({ type: "ERROR", error: err, containerId, port })),
      );
    }
    if (type === "STOP_CAPTURE") {
      if (stopHandlers[`${containerId}:${port}`]) {
        stopHandlers[`${containerId}:${port}`]();
        delete stopHandlers[`${containerId}:${port}`];
      }
    }
  });

  ws.on("close", () => {
    Object.values(stopHandlers)
      .forEach(stopHandler => stopHandler());
  });
}

function startDump(containerId, port, onMessage, onError) {
  let currentPacket = "";
  let currentPacketLength = 0;

  const outputStream = new stream.PassThrough();
  outputStream.on("data", function(chunk) {
    const dataLines = chunk.toString("utf8")
      .split(/[\r]?\n/)
      .map(l => l.trim());

    dataLines.forEach((data) => {
      if (!data.startsWith("0x")) return; 

      const hexBytes = data.substr(9, 39).replaceAll(" ", "").trim();

      if (data.startsWith("0x0000")) {
        currentPacket = "";
        currentPacketLength = parseInt(hexBytes.substr(4, 4), 16);
      }

      currentPacket += hexBytes;

      if (currentPacket.length / 2 >= currentPacketLength) {
        onMessage(currentPacket);
        currentPacket = "";
      }
    })      
  });

  let createdContainer = null;

  docker.createContainer({
    AttachStdout: true,
    AttachStderr: true,
    Tty: true,
    Image: "nicolaka/netshoot",
    Cmd: ["tcpdump", "-i", "eth0", "-nX", "port", `${port}`],
    HostConfig: {
      AutoRemove: true,
      NetworkMode: `container:${containerId}`,
      PidMode: `container:${containerId}`,
    },
    Labels: {
      "io.mikesir87/purpose": "tcpdump-websocket"
    },
  }).then((container) => {
    createdContainer = container;
    return container.attach({
      stream: true,
      stdout: true,
      stderr: true
    });
  }).then((stream) => {
    stream.setEncoding('utf8');
    stream.pipe(outputStream, {
      end: true
    });
    return createdContainer.start();
  }).catch(err => {
    console.error(err);
    onError(err);
  });

  return () => {
    if (createdContainer)
      createdContainer.kill()
        .catch((e) => {
          if (e.message.indexOf("No such container") > -1)
            console.log("Container already killed");
        });
  };
} 

module.exports = {
  handleWebsocket,
};