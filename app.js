const http = require('http');

// Root file that makes up Node.js application (sometimes also called server.js)

// Takes req listener, a function that will execute for every incoming request. It receives req and res object. Req for incoming message that allows us to receive data from request and res object which we can use to return a response to whoever sent the request
const server = http.createServer((req, res) => {
  console.log(req.url, req.method, req.headers);
  res.setHeader('Content-Type', 'text/html');
  // write method allows us to write data to respone, and it works in chunks/line by line
  res.write('<html>');
  res.write('<head><title>My First Page</title></head>');
  res.write('<body><h1>Hello from my Node.js Server!</h1></body>');
  res.write('</html>');
  // Tells Node we're done creating the response
  res.end();
});

server.listen(3000);
