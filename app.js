const http = require('http');

const routes = require('./routes');

// Root file that makes up Node.js application (sometimes also called server.js)

const server = http.createServer(routes);

server.listen(3000);
