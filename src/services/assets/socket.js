//netcat socket code
const NetcatServer = require('netcat/server')
// const NetcatClient = require('netcat/client')

function onData (socket, chunk) {
	const chunkStr = chunkToString(chunk);
  	console.log(socket.id, 'got', chunkStr); // prints the received string

  	//interpret the received data
  	interpret(chunkToString);

  	socket.write('acknowledged\n') // reply to the client
}

function chunkToString(chunk){
	const result = chunk.toString()
	return result.slice(0, result.length-1)
}

function interpret(input){
	//check for correct format

	//interpret the action to be performed

	//execute action
}

module.exports = async function() {
	const nc = new NetcatServer()
	nc.port(2389).listen().on('data', onData);
};