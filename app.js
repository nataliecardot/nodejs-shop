const http = require('http');

// Root file that makes up Node.js application (sometimes also called server.js)

// Takes req listener, a function that will execute for every incoming request. It receives req and res object. Req for incoming message that allows us to receive data from request and res object which we can use to return a response to whoever sent the request
const server = http.createServer((req, res) => {
  const url = req.url;
  if (url === '/') {
    // write method allows us to write data to respone, and it works in chunks/line by line
    res.write('<html>');
    res.write('<head><title>My First Page</title></head>');
    // Buttom with type submit in a form sends new request
    // Form action is URL the request that is generated automatically on button click should be sent to
    res.write(
      '<body><form action="/message" method="POST"><input type="text" name="message"><button type="submit">Send</button></form></body>'
    );
    res.write('</html>');
    // Tells Node we're done creating the response
    // return is needed to return from the anonymous function in order to not continue the code below the if statement (not to return the response) (must not write or do anything after res.end())
    return res.end();
  }
  res.setHeader('Content-Type', 'text/html');
  res.write('<html>');
  res.write('<head><title>My First Page</title></head>');
  res.write('<body><h1>Hello from my Node.js Server!</h1></body>');
  res.write('</html>');
  res.end();
});

server.listen(3000);
