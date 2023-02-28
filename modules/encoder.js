const {Buffer} = require('buffer');
const stream = require('stream');
const zlib = require('zlib');
const fs = require('fs');

function error(err){}

module.exports = (status,raw,req,res,headers)=>{
    try{

        const encoder = req.headers['accept-encoding'];
        const data = stream.Readable.from(raw);let lib;
    
        if (/\bbr\b/.test(encoder)) {
            lib = 'createBrotliCompress';
            headers["content-encoding"] = 'br'; 
            headers["vary"] = "Accept-Encoding";
        } else if (/\bgzip\b/.test(encoder)) {
            lib = 'createGzip';
            headers["vary"] = "Accept-Encoding";
            headers["content-encoding"] = 'gzip'; 
        } else if ((/\bdeflate\b/).test(encoder)) {
            lib = 'createDeflate';
            headers["vary"] = "Accept-Encoding";
            headers["content-encoding"] = 'deflate';
        }
        
        res.writeHead( status, headers );
        if(!lib) return stream.pipeline(data, res, error);
        else return stream.pipeline(data, zlib[lib](), res, error);  

    } catch(e) { res.writeHead( status, headers ); res.end( raw ) }
}
