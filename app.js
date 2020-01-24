const http = require('http');
const fs = require('fs');

// Root file that makes up Node.js application (sometimes also called server.js)

// Takes req listener, a function that will execute for every incoming request. It receives req and res object. Req for incoming message that allows us to receive data from request and res object which we can use to return a response to whoever sent the request
const server = http.createServer((req, res) => {
  const url = req.url;
  const method = req.method;
  // There is no req.data; incoming data is instead sent as a stream of data. A stream is basically an ongoing process. The request is simply read by Node in chunks and in the end, eventually it's done (fully parsed). This is done so we can start working on individual chunks without having to wait for the full request being read. Node handles all requests this way because it doesn't know in advance how big and complex they are
  // To organize these incoming chunks, you use a buffer (like a bus stop) -- a construct that allows you to work with multiple chunks before they're fully parsed
  // We can do so with even listener - listen for data event (req.on('data') ... below)
  if (url === '/') {
    // write method allows us to write data to respone, and it works in chunks/line by line
    res.write('<html>');
    res.write('<head><title>Enter message</title></head>');
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
  if (url === '/message' && method === 'POST') {
    // When a stream processor receives data faster than it can digest, it puts the data in a buffer
    // A buffer is a temporary storage location in memory that we can grab data from
    const body = [];
    req.on('data', chunk => {
      console.log(chunk);
      // The constant stores a reference to an array. Not modifying the constant's value, but the array it points to. The const declaration creates a read-only reference to a value. It does not mean the value it holds is immutable, just that the variable identifier cannot be reassigned. For instance, in the case where the content is an object, this means the object's contents (e.g., its parameters) can be altered
      body.push(chunk);
    });
    // Will be fired once parsing of incoming request data is done
    // In this function, can now rely on all the data chunks being read in, and all are stored in body now
    // This return prevents execution of code following this req.on function. If you don't include it, the event listener would be registered, but it would never be called due to the code following it being called, with req.end()
    // In other words, the return just stops the function from executing further, but before it is stopped we register an event listener on the 'end' event for the request object so once that happens the code in the callback to the event listener can still be invoked
    return req.on('end', () => {
      // Buffer is made available globally by Node.js
      // Creates new buffer and adds all the chunks inside the body to it
      // Buffer.concat(): concat() method joins all buffer objects in an array into one buffer object
      // Conversion to string only works because incoming data will be text because body of request will be text
      const parsedBody = Buffer.concat(body).toString();
      // Form automatically sends request where it takes all the input data and puts it into the request body as key-value pairs where the names assigned to the inputs are the keys, and the values are what the user entered
      console.log(parsedBody);
      // Now can store input in the file
      // split() method is used to split a string into an array of substrings using specified separator provided in argument
      const message = parsedBody.split('=')[1];
      fs.writeFileSync('message.txt', message);
      // The HTTP 302 Found redirect status response code indicates that the resource requested has been temporarily moved to the URL given by the Location header
      res.statusCode = 302;
      res.setHeader('Location', '/');
      return res.end();
    });
  }
  console.log('testy');
  res.setHeader('Content-Type', 'text/html');
  res.write('<html>');
  res.write('<head><title>My First Page</title></head>');
  res.write('<body><h1>Hello from my Node.js Server!</h1></body>');
  res.write('</html>');
  res.end();
});

server.listen(3000);
