const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { createProxyMiddleware } = require("http-proxy-middleware");
const request = require("request");
const app = express();

function activityCheck(server){                           //ping and echo - is the server running
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

setInterval(() => {                                     // Interval for ping and echo (every 5 seconds)
  services.forEach((server) => {
    activityCheck(server)
  })
}, 5000)


const origins = [
  "http://localhost:5173",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3003",
  "http://localhost:3004",
  "http://localhost:3009",
  "http://localhost:3011",
  "http://localhost:3012",
  "http://localhost:3005"

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


app.use((req, res) => {               //load balancer middleware 
  let activeServers = []              
  services.forEach((server) => {      // only active servers are recieving requests
    if(server.isRunning == true) {
      activeServers.push(server)      // save the active servers in an array
    }
  })

  var currServer=""
  var url = extractRoute(req.url)                // calling method to make sure it only contains the two first words (/api/resourseName)
  activeServers.forEach((activeServer) => {      // search for the service with the same route that should receive the request 
    if(url === activeServer.route){
      currServer = activeServer
    }
  })
 
  const port = roundRobinPort(currServer.ports, currServer.index)             // if there are many instances of the same service - balance between them
  currServer.index = port.index
  currServer.host = `http://localhost:${port.portValue}`              // give the portnumber for the port that should receive the request
  req.pipe(request(currServer.host + req.url)).pipe(res)              // forwarding the request to the correct service (the straw)
})

function extractRoute(url){
  var tempArr = url.split("/")
  var route = "/"+tempArr[1]+ "/"+tempArr[2]
  return route
}




const services = [                                      //Service array
    {
      route: "/api/patients",
      target: "",
      isRunning: true,
      host:"",
      ports: [
        {port: 3001},
        {port: 3004},
        {port: 3009}
      ] ,
      index:0,
      
    },
    {
        route: "/api/appointments",
        target: "",
        isRunning: true,
        host: "",
        ports: [
          {port: 3002},
          {port: 3011},
          {port: 3012}

        ],
        index:0,
      },
      {
        route: "/api/clinics",
        target: "",
        isRunning: true,
        host: "",
        ports: [
          {port: 3003}
        ],
        index:0,
      },
      {
        route: "/api/dentists",
        target: "",
        isRunning: true,
        host: "",
        ports: [
          {port: 3005},
        ],
        index:0,
      },
   ];

   services.forEach(service => {                    // populate the target and the host with the correct values using roundRobin if there is duplicate services
      var portAndIndex = roundRobinPort(service.ports, service.index)
      var port = portAndIndex.portValue
      service.index = portAndIndex.index

      service.target = `http://localhost:${port}${service.route}`
      service.host = `http://localhost:${port}`
   })

   function roundRobinPort(ports,index){
      
      var portValue = 0

      if(ports.length === 1){                 //if there is only one service
        portValue = ports[index].port
        portAndIndex = {portValue, index}
       
        return portAndIndex
      }else{                              //If there is duplicate services
        index = (index +1 ) % ports.length   //roundRobin algorithm
        portValue = ports[index].port
        portAndIndex = {portValue, index}     //returning the portnumber and the new index value
        return portAndIndex
      }
   }



services.forEach(({ route, target }) => {           //Gateway receiving Api calls and rerouts it to its corresponding service
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
