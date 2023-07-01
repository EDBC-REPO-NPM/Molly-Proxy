const proxy = require('./main');
const path = require('path');

proxy.createHTTPServer({
    location: [
        '/cors  pass  https://www.youtube.com/$PATH',
        '/      pass  https://www.youtube.com/$PATH',
    ], port: 3000
});