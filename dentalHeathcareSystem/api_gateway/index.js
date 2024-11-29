const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { createProxyMiddleware } = require("http-proxy-middleware");
const request = require("request");
const app = express();

function activityCheck(server){
  request(server.host + '/active', (err,res) =>{
    if(!err && res.statusCode == 200){
      server.isRunning = true
      console.log(`Server ${server.host} is running`);
    }else{
      server.isRunning = false;
      console.log(`Server ${server.host} is not running`);
    }
  })
}

setInterval(() => {
  services.forEach((server) => {
    activityCheck(server)
  })
}, 5000)


const origins = [
  "http://localhost:5173",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3003",


];
// Middleware setup
// app.use(cors()); // Enable CORS
app.use(
  cors({
    origin: origins, // Allow all origins
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// Also, handle preflight requests for all routes
app.options("*", cors());
app.use(helmet()); // Add security headers
app.use(morgan("combined")); // Log HTTP requests
app.disable("x-powered-by"); // Hide Express server information

let currentServerIndex = 0;
app.use((req, res) => {
  let activeServers = []
  services.forEach((server) => {
    if(server.isRunning == true) {
      activeServers.push(server)
    }
  })

  let currServer = activeServers[currentServerIndex]
  if(currServer){
    req.pipe(request(currServer.host + req.url)).pipe(res)  //The straw =)
  }

  currentServerIndex = (currentServerIndex +1 ) % activeServers.length
})


const services = [
    {
      route: "/api/patients",
      target: "http://localhost:3001/api/patients",
      isRunning: true,
      host: "http://localhost:3001",
    },
    {
        route: "/api/appointments",
        target: "http://localhost:3002/api/appointments",
        isRunning: true,
        host: "http://localhost:3002",
      },
      {
        route: "/api/clinics",
        target: "http://localhost:3003/api/clinics",
        isRunning: true,
        host: "http://localhost:3003",
      }
   ];

services.forEach(({ route, target }) => {
    // Proxy options
    const proxyOptions = {
      target,
      changeOrigin: true,
      pathRewrite: {
        [`^${route}`]: "",
      },
    };
    app.use(route, createProxyMiddleware(proxyOptions));
});


const PORT = 3000;
// Start Express server
app.listen(PORT, () => {
 console.log(`Gateway is running on port ${PORT}`);
})
   