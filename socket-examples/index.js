const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
const fs = require('fs');

app.use(express.static(__dirname + '/public'));

// Default namespace
function onConnection(socket) {
	// console.log(socket.id)
	socket.broadcast.emit('newConnection', `hi! Someone else has connected with id ${socket.id}`, socket.id);
	socket.on('emitMsgBack', (data) => socket.emit('emitMsgBack', `This was your message: ${data}`));
	socket.on('emitToOthers', (data) => socket.broadcast.emit('emitToOthers', `This was your message: ${data}`));
	socket.on('disconnect', () => socket.broadcast.emit('disconnectedClient', 'hi! Someone has disconnected!'));
	socket.on('emitWithAck', (data, fn) => {
		console.log('this line is executed in the backend');
		fn(`this line is executed in the frontend, with this string as an argument, with ${data} or backend if necessary`);
	});
	fs.readFile(`${__dirname}/public/rum.jpg`, (err, buffer) => {
		socket.emit('welcomeImage', {
			image: true,
			buffer: buffer.toString('base64')
		})
	});
	socket.on('sendToLastConnected', (data) => {
		socket.to(data.target).emit('sendToLastConnected' , data.message);
	})
}
io.on('connection', onConnection);

// Custom namespace
function onVIPConnection(socket) {
	socket.broadcast.emit('newVIP', 'VIP!');
	socket.on('joinAdminVIP', () => {
		socket.join('VIPAdmin');
		socket.to('VIPAdmin').emit('adminJoined', 'EMIT: new person has joined admin room in VIP namespace');
	});
}
const VIP = io.of('/VIP'); // Declare the custom namespace (unrelated to the URL)
VIP.on('connection', onVIPConnection);

http.listen(port, () => console.log('listening on port ' + port));
