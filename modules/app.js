const {Buffer} = require('buffer');
const path = require('path');
const api = require('./api');
const url = require('url');
const fs = require('fs'); 

/*--─────────────────────────────────────────────────────────────────────────────────────--*/

function parser(req,arg){
    const parse = url.parse( req.url,false );
    const path = req.url.split('/').slice(1);

    for( let base of (arg.match(/\$PATH[^/\n]?/gi)||[]) ){
        const i = base.match(/\d+/gi); if( i ){ 
            arg = arg.replace(base,path[i]); continue; 
        }   arg = arg.replace(base,path.join('/'));
    }

    return arg.replace(/\$QUERY/gi,parse.search);
}

/*--─────────────────────────────────────────────────────────────────────────────────────--*/

function runProx( req,res,location ){
    const arg = location.match(/[^\n\s ]+/gi); if( (new RegExp(arg[0])).test(req.url) ){
        if( (/^\/.+/).test(arg[0]) ) req.url = req.url.replace(arg[0],''); 
        switch(arg[1]){
            case 'rdir': return api.redirect(req,res,parser(req,arg[2]));
            case 'file': return api.sendFile(req,res,parser(req,arg[2]));
            case 'pass': return api.sendFile(req,res,parser(req,arg[2]));
        }
    }
}

/*--─────────────────────────────────────────────────────────────────────────────────────--*/

module.exports = function(req,res,config,protocol){
    try { 
        
        const host = req.headers['x-forwarded-host'] || 
                     req.headers['host'];
        req.protocol = protocol; 

        if( !config.location ) return api.send( req,res,'Not Location List Found',404 );

        if( Array.isArray( config.location ) ) 
            for( let location of config.location ){
                const d = runProx( req,res,location );
                if( d ) return d;
            }

        else if( typeof config.location == 'object' )
            for( let location of config.location[req.host] ){
                const d = runProx( req,res,location );
                if( d ) return d;
            }
    
        return api.send( req,res,'something went wrong',404 );

    } catch(e) { return api.send( req,res,e.message,404 ) }
}
