
const { Buffer } = require('buffer');
const fetch = require('molly-fetch');
const encoder = require('./encoder');
const header = require('./header');
const url = require('url');
const fs = require('fs');

// ────────────────────────────────────────────────────────────────────────────────────────────────────────────── //

const mime = {
	
	"txt" : "text/plain",
	"text": "text/plain",
	
	"otf" : "font/otf",
	"ttf" : "font/ttf",
	"woff": "font/woff",
	"woff2":"font/woff2",
	
	"oga" : "audio/ogg",
	"aac" : "audio/aac",
	"wav" : "audio/wav",
	"mp3" : "audio/mpeg",
	"opus": "audio/opus",
	"weba": "audio/webm",
	
	"ogv" : "video/ogg",
	"mp4" : "video/mp4",
	"ts"  : "video/mp2t",
	"webm": "video/webm",
	"mpeg": "video/mpeg",
	"avi" : "video/x-msvideo",
	
	"css" : "text/css",
	"csv" : "text/csv",
	"html": "text/html",
	"scss": "text/scss",
	"ics" : "text/calendar",
	"js"  : "text/javascript",
	"xml" : "application/xhtml+xml",

	"bmp" : "image/bmp",
	"gif" : "image/gif",
	"png" : "image/png",
	"jpg" : "image/jpeg",
	"jpeg": "image/jpeg",
	"webp": "image/webp",
	"svg" : "image/svg+xml",
	"ico" : "image/vnd.microsoft.icon",
	
	"zip" : "application/zip",
	"gz"  : "application/gzip",
	"sh"  : "application/x-sh",
	"json": "application/json",
	"tar" : "application/x-tar",
	"rar" : "application/vnd.rar",
	"7z"  : "application/x-7z-compressed",
	"m3u8": "application/vnd.apple.mpegurl",
	
	"pdf" : "application/pdf",
	"doc" : "application/msword",
	"vsd" : "application/vnd.visio",
	"xls" : "application/vnd.ms-excel",
	"ppt" : "application/vnd.ms-powerpoint",
	"swf" : "application/x-shockwave-flash",
	"ods" : "application/vnd.oasis.opendocument.spreadsheet",
	"odp" : "application/vnd.oasis.opendocument.presentation",
	"odt" : "application/vnd.oasis.opendocument.presentation",
	"xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	"docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	"pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    
};

// ────────────────────────────────────────────────────────────────────────────────────────────────────────────── //

function setmimetype( _path ){
	if( !(/\.\w+$/).test(_path) ) return 'text/html';
	const keys = Object.keys(mime)
	for( let key of keys ){ if( _path.endsWith(key) ) 
		return mime[key];
	}	return 'text/plain';
}

function parseParameters( ...arg ){
	const obj = { status: 200, cache: false }; 
	for( var i in arg ){
		switch( typeof arg[i] ){
			case 'number': obj['status'] = arg[i]; break;
			case 'boolean':obj['cache'] = arg[i]; break;
			case 'string': obj['mime'] = arg[i]; break;
			default: break;
		}
	}	return obj;
}

function parseData( data ){
	if( typeof data === 'object' )
		 return JSON.stringify(data);
	else return data;
}

// ────────────────────────────────────────────────────────────────────────────────────────────────────────────── //

function sendStaticFile( req,res,url,status ){
	try{

		const size = fs.statSync( url ).size;
        const mimetype = setmimetype( url );
		const range = req.headers.range;

		if( range ) {
			const interval = range.match(/\d+/gi);
			const chuckSize = Math.pow( 10,6 )*10;

			let start = +interval[0]; 
			let end = interval[1] ? +interval[1]:
				Math.min(chuckSize+start,size-1);

			const headers = header.stream(mimetype,start,end,size);
			const data = fs.createReadStream( url,{start,end} );
			encoder( 206, data, req, res, headers ); return 0;
		} else { 
			res.writeHead( status, header.static(mimetype,true) );
			const str = fs.createReadStream(url); str.pipe(res);
		}
	} catch(e) { output.send(req,res,e,404); }
} 

// ────────────────────────────────────────────────────────────────────────────────────────────────────────────── //

function sendStreamFile( req,res,url,status ){
	try { 

		url.headers = !url.headers ? req.headers : 
									url.headers;
		url.method = !url.method ? req.method : 
								   url.method;
		url.responseType = 'stream';
		url.decode = false;
		url.body = req;
		
		return fetch(url).then((rej)=>{
			res.writeHeader( rej.status, rej.headers );
			rej.data.pipe( res );
		}).catch((rej)=>{ 
			if( url.headers.range ) rej.status = 100;
			res.writeHeader( rej.status, rej.headers );
			rej.data.pipe( res );
		});

	} catch(e) { output.send(req,res,e.message,404); }
}

// ────────────────────────────────────────────────────────────────────────────────────────────────────────────── //

const output = new Object();

output.send = ( req,res,data,...arg )=>{
	const d = parseData( data ); const v = parseParameters( ...arg );
	const mimetype = typeof d === 'object' ? 'application/json' : 'text/plain';
	encoder( v.status, d, req, res, header.static( mimetype, v.cache ) );
	return true;
}

output.sendFile = ( req,res,_path,...arg )=>{
	const v = parseParameters( ...arg );
	if((/^http/i).test(_path)) _path = { url:_path };
	if(typeof _path === 'object') sendStreamFile( req,res,_path,v.status );
	else if(fs.existsSync(_path)) sendStaticFile( req,res,_path,v.status );
	else output.send( req, res, 'file not found', 404); return true;
}

output.redirect = ( req,res,_url )=>{ 
	res.writeHead(301,{'location':_url}); 
	res.end(); return true; 
}

module.exports = output;
