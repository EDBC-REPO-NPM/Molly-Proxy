const output = new Object();

function expirationAge(){
    const today = new Date();
    const tomrw = new Date();
    tomrw.setDate( tomrw.getDate() + 1 );
    tomrw.setHours(0); tomrw.setSeconds(0);
    tomrw.setMinutes(0); tomrw.setMilliseconds(0);
	return parseInt((tomrw.getTime()-today.getTime())/Math.pow(10,3));
}

output.header = ( headers,cache,size )=>{
	const age = expirationAge();

	if( cache ) 
		headers["Cache-Control"] = `public, max-age=${age}`;
		headers["Set-Cookie"] = 'cross-site-cookie=whatever; SameSite=None; Secure';

	if( size!=0 ) headers["Content-Length"] = size;
		headers["powered-by"] = "molly-proxy";
		headers["x-xss-protection"] = 0;
	
	return headers;			
}
	
output.static = function( mimeType,cache ){
	const headers = { "Content-Type":mimeType }; 
	return output.header( headers,cache,0 );
}

output.stream = function( mimeType,start,end,size ){
	const length = end-start+1; const headers = {
		"Content-Range":`bytes ${start}-${end}/${size}`,
		"Accept-Ranges":"bytes", "Content-Type": mimeType,
	};	return output.header( headers,true,length );
}

module.exports = output;