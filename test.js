const proxy = require('./main');
const path = require('path');

proxy.createHTTPServer({
    location: [
        '/cors  pass  https://www.google.com/$PATH',
        '/      pass  https://www.google.com/$PATH',
    ], port: 3000
});