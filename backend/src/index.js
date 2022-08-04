const express = require("express");
const path = require("path");
const { router } = require("./api");
const { handleWebsocket } = require("./api/websocket");

const app = express();
require("express-ws")(app);

app.use(express.static(path.join(__dirname, "static")));
app.use(express.json());

app.use("/api", router);
app.ws("/api/tcpdump", handleWebsocket);

app.use("*",  (req, res) => {
  // https://github.com/HenningM/express-ws/issues/64
  if (req.header('sec-websocket-version') === undefined) {
    res.sendFile(path.join(__dirname, "static", "index.html"));
  }
});

app.listen(3000, () => console.log("Listening on port 3000"));

process.on("SIGINT", () => process.exit());
process.on("SIGTERM", () => process.exit());