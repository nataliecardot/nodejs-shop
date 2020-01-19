const http = require('http');

// Root file that makes up Node.js application (sometimes also called server.js)

// Takes req listener, a function that will execute for every incoming request. It receives req and res object. Req for incoming message that allows us to receive data from request and res object which we can use to return a response to whoever sent the request
const server = http.createServer((req, res) => {
  console.log(req);
});

server.listen(3000);
