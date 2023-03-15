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

	if( cache ) 
		headers["cache-control"] = `public, max-age=${expirationAge()}`;
	if( size!=0 ) headers["content-length"] = size;
		headers["powered-by"] = "molly-proxy";
		headers["x-xss-protection"] = 0;
	
	return headers;			
}
	
output.static = function( mimeType,cache ){
	const headers = { "content-type":mimeType }; 
	return output.header( headers,cache,0 );
}

output.stream = function( mimeType,start,end,size ){
	const length = end-start+1; const headers = {
		"content-range":`bytes ${start}-${end}/${size}`,
		"accept-ranges":"bytes", "content-type": mimeType,
	};	return output.header( headers,true,length );
}

module.exports = output;