const Docker = require("dockerode");
const stream = require('stream');

const docker = new Docker();

function getContainers(req, res) {
  docker.listContainers()
    .then((containers) => res.send(containers))
    .catch(err => res.status(500).send(err));
}

function getPortsForContainer(req, res) {
  const {containerId} = req.params;

  let netstatOutput = "";
  const netstatOutputStream = new stream.PassThrough();
  netstatOutputStream.on("data", function(chunk) {
    const lineOutput = chunk.toString("utf8").split("\r\n");
    netstatOutput += lineOutput
      .filter(l => l.indexOf("LISTEN") > -1)
      .join("\n") + "\n";
  });

  let psOutput = "";
  const psOutputStream = new stream.PassThrough();
  psOutputStream.on("data", function(chunk) {
    const lineOutput = chunk.toString("utf8").split("\r\n");
    psOutput += lineOutput
        .filter(l => l.indexOf("COMMAND") === -1)
        .join("\n");
  });

  docker.run("nicolaka/netshoot", ["netstat", "-tulpn"], netstatOutputStream, {
    "HostConfig": {
      "AutoRemove": true,
      "NetworkMode": `container:${containerId}`,
      "PidMode": `container:${containerId}`,
    }
  }).then(() => {
    console.log("netstsat", netstatOutput);
    return netstatOutput.split("\n")
      .filter(l => l)
      .map(l => l.split(/\s+/))
      .map(line => ({
        port: line[3].split(":").pop(),
        pid: line.slice(6).join(" ").split("/")[0],
      }))
      .filter(p => p.port && p.pid != "-")
      .filter((p, indx, a) => a.findIndex(p2 => p2.port == p.port) === indx);
  }).then((ports) => {
    return Promise.all([
      ports,
      docker.run("nicolaka/netshoot", ["ps", "aux"], psOutputStream, {
        "HostConfig": {
          "AutoRemove": true,
          "NetworkMode": `container:${containerId}`,
          "PidMode": `container:${containerId}`,
        }
      })
    ]);
  }).then(([ports, psResults]) => {
    console.log("processes", psOutput, ports)
    const processes = psOutput.split("\n")
      .map(l => l.trim().split(/\s+/));

    const portsWithProcesses = ports.map(p => {
      const processRow = processes.find(process => p.pid == process[0]);
      console.log(processes, p);
      return { ...p, process: processRow.slice(3).join(" ") }
    });

    res.send({ ports: portsWithProcesses });
  }).catch(err => {
    if (err.message.indexOf("No such image"))
      return docker.pull("nicolaka/netshoot")
        .then(() => getPortsForContainer(req, res));

    console.error(err);
    res.status(500).send(err)
  });
}

module.exports = {
  getContainers,
  getPortsForContainer,
};