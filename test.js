const proxy = require('./main');
const path = require('path');

const dir = path.join(process.cwd(),'../','hottler','www','viewer');
const end = '.js$|.css$|.html$|.webp$|.otf$|.ico';

proxy.createHTTPServer({
    location: [
        `${end} file  ${dir}/$PATH`,
        '/cors  pass  http://localhost:27016/$PATH',
        '/      pass  http://localhost:3000/$PATH',
    ]
});