const path = require('path');

// dirname returns directories from a path (see https://node.readthedocs.io/en/latest/api/path/#pathdirnamep); just have to figure out for which file we want to get the directory name. For this we can use global process variable, available in all files (don't need to import it), and there you will have a mainModule property. This will refer to the main module that started your application, so in this case, to the module we created in app.js. Then we can call filename to find out in which file this module was spun up. So process.mainModule.filename gives us the file responsible for the fact our application is running, and this filename is what we pass to dirname to get a path to that directory
module.exports = path.dirname(process.mainModule.filename);
