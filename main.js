const cluster = require('cluster');
const https = require('https');
const http2 = require('http2');
const path = require('path');
const http = require('http');
const net = require('net');
const fs = require('fs');

const app = require('./modules/app');
const ssl = require('./modules/ssl');

// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────── //

const output = new Object();
const HTTP = process.env.HTTP || process.env.PORT || 8080;
const HTTPS = process.env.HTTPS || process.env.PORT || 8443;
const HTTP2 = process.env.HTTP2 || process.env.PORT || 8443;

// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────── //

function copy( A,B ){
  const result = new Object();
  for( var i in A ) result[i] = A[i];
  for( var i in B ) result[i] = B[i];
  return result;
}

// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────── //

output.createHTTPServer = function( ...arg ){

  const clb = typeof arg[0] == 'function' ? arg[0] :
              typeof arg[1] == 'function' ? arg[1] : null;
  
  const cfg = typeof arg[0] == 'object' ? arg[0] :
              typeof arg[1] == 'object' ? arg[1] : null;

  const host = cfg.host || '0.0.0.0';
  const port = cfg.port || HTTP;
  const th = cfg.thread || 1;

  if (cluster.isPrimary) {

    for( let i=th; i--; ) { cluster.fork(); }
    cluster.on('exit', (worker, code, signal) => { cluster.fork();
      console.log(`worker ${worker.process.pid} died by: ${code}`);
    });
    
  } else {
    const server = http.createServer( (req,res)=>{ app(req,res,cfg,'HTTP') } );
      server.listen( port,host,()=>{ console.log(JSON.stringify({
        name: 'molly-proxy', protocol: 'HTTP', port: port, host: host 
      })); if(clb) clb(server);
    }).setTimeout( cfg.timeout );
  }

}
	
// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────── //

output.createHTTPSServer = function( ...arg ){

  const clb = typeof arg[0] == 'function' ? arg[0] :
              typeof arg[1] == 'function' ? arg[1] : null;
  
  const cfg = typeof arg[0] == 'object' ? arg[0] :
              typeof arg[1] == 'object' ? arg[1] : null;

  const host = cfg.host || '0.0.0.0';
  const key  = ssl.default(cfg.key);
  const port = cfg.port || HTTP2; 
  const th   = cfg.thread || 1;

  if (cluster.isPrimary) {

    for( let i=th; i--; ) { cluster.fork(); }
    cluster.on('exit', (worker, code, signal) => { cluster.fork();
      console.log(`worker ${worker.process.pid} died by: ${code}`);
    });

  } else {
    const server = https.createServer( key,(req,res)=>{ app(req,res,cfg,'HTTPS') } );
      server.listen( port,host,()=>{ console.log(JSON.stringify({
        name: 'molly-proxy', protocol: 'HTTPS', port: port, host: host 
      })); if( clb ) clb(server); ssl.parse( server, cfg.key );
    }).setTimeout( cfg.timeout );
  }

}
	
// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────── //

output.createHTTP2Server = function( ...arg ){

  const clb = typeof arg[0] == 'function' ? arg[0] :
              typeof arg[1] == 'function' ? arg[1] : null;
  
  const cfg = typeof arg[0] == 'object' ? arg[0] :
              typeof arg[1] == 'object' ? arg[1] : null;

  const host = cfg.host || '0.0.0.0';
  const key  = ssl.default(cfg.key);
  const port = cfg.port || HTTP2; 
  const th   = cfg.thread || 1;

  if (cluster.isPrimary) {

    for( let i=th; i--; ) { cluster.fork(); }
    cluster.on('exit', (worker, code, signal) => { cluster.fork();
      console.log(`worker ${worker.process.pid} died by: ${code}`);
    });

  } else {
    const server = http2.createSecureServer( key,(req,res)=>{ app(req,res,cfg,'HTTP2') } );
      server.listen( port,host,()=>{ console.log(JSON.stringify({
        name: 'molly-proxy', protocol: 'HTTP2', port: port, host: host 
      })); if( clb ) clb(server); ssl.parse( server, cfg.key );
    }).setTimeout( cfg.timeout ); 
  }

}

module.exports = output;
