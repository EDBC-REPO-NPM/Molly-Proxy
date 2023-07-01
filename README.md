# MOLLY-PROXY: A High-Performance Reverse Proxy in Node.js

Introducing MOLLY-PROXY, a high-performance Node.js reverse proxy that supports HTTP and HTTPS + SNI with the ability to run multiple instances using clusters. This reverse proxy is designed to handle a large number of requests per second while providing fast and reliable performance.

With support for HTTP and HTTPS + SNI, this reverse proxy is capable of handling secure and non-secure requests. Additionally, by using clusters, it's possible to run multiple instances of the reverse proxy to distribute the workload and further improve scalability and performance.

MOLLY-PROXY is ideal for high-traffic web applications that require scalable and reliable performance. With its ability to handle multiple requests simultaneously, this reverse proxy can significantly improve response time and page load times for web applications.

## Installation

To install MOLLY-PROXY, simply run the following command in the command line:

```bash
npm install molly-proxy
```

## Configuration

Before running the reverse proxy, you need to configure the server information and SSL/TLS certificates. Here's an example of how it should look like:

HTTP Server Proxy
```javascript
const proxy = require('./main');
const path = require('path');

proxy.createHTTPServer({
    location: [
        '/cors  pass  https://www.google.com/$PATH',
        '/      pass  https://www.google.com/$PATH',
    ], 
    port: 80, thread: 1,
});

```

HTTPS Server Proxy
```javascript
const key = { //here we place the ssl
    'page1.xyz': {
        cert: '/root/cert/page1/fullchain.pem',
        key:  '/root/cert/page1/key.pem',
    }, 
    'page2.xyz': {
        cert: '/root/cert/page2/fullchain.pem',
        key:  '/root/cert/page2/key.pem',
    }
};

proxy.createHTTPSServer({
    port: 443, thread: 2, key, location: {

        'page1.xyz': [ //rules for page 1
            '/      pass  http://localhost:2000/$PATH',
        ],

        'page2.xyz': [ //rules for page 2
            '/      pass  http://localhost:3000/$PATH',
        ],

        '': [ //rules for both pages
            '/cors  pass  http://localhost:27016/$PATH',
        ]
    
    }
});
```

In this example, the reverse proxy will run on the default HTTP and HTTPS ports (80 and 443, respectively) and will target two destination servers running on ports 3000 and 3001 on the same machine.

The reverse proxy will run on the specified HTTP and HTTPS ports and redirect traffic to the specified destination servers.

## Configuration

There are 3 basic rules in MOLLY-PROXY:
- **rdir:** allows traffic to be redirected from the proxy to the destination server.
- **pass:** allows content to be sent from a server to the client.
- **file:** allows static content to be served.

## Contributions

Contributions are welcome! If you wish to contribute, please submit a pull request or open an issue.

## License

This project is licensed under the MIT License.
