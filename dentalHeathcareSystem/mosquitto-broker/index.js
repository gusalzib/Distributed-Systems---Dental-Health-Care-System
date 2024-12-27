const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { createProxyMiddleware } = require("http-proxy-middleware");
const request = require("request");
const app = express();
const mqttBroker = require("./mqtt-broker.js");



//Keeping this code until we decided what to do with the old http code.
const PORT = 3030;
app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true
  })
);
app.options("*", cors());
app.use(helmet()); 
app.use(morgan("dev")); 
app.use(express.json());


// Start Express server
app.listen(PORT, () => {
 console.log(`Broker is running on port ${PORT}`);
})
