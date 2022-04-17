const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const { initRoom } = require('./room');
const { makeRoomId } = require('./utils.js');

// setup express server and serve the static html files from client
const app = express();
app.use(express.static(`${__dirname}/../client`));

const server = http.createServer(app); // create http server
const io = socketio(server); // create socket server for websocket calls

const clientRooms = {};
const roomState = {};

// start listening to socket requests
io.on('connection', (sock) => {

	console.log("new connection");

	// handle socket events

	sock.on('newRoom', handleNewRoom);
	function handleNewRoom() {
		let roomName = makeRoomId(5); // make room code of 5 characters
		clientRooms[sock.id] = roomName;

		console.log(clientRooms);

		sock.emit('roomCode', roomName);
		roomState[roomName] = initRoom();

		console.log(roomState[roomName])

		sock.join(roomName);
		sock.number = 1;
		sock.emit('init', 1, roomState[roomName], roomName);
	}

	sock.on('joinRoom', handleJoinRoom);
	function handleJoinRoom(roomName) {
		console.log(roomName);
		
		sock.join(roomName);
		sock.number = 2;
		sock.emit('init', 2, roomState[roomName], roomName);

		io.sockets.in(roomName).emit('startGame'); // enable the dice roll button
	}

	sock.on('diceRoll', handleDiceRoll);
	function handleDiceRoll(activePlayer, roomName) {
		if(activePlayer == roomState[roomName].activePlayer){
			let dice = Math.floor(Math.random() * 6) + 1; // generate random number b/w 1 and 6
			console.log(dice);
			console.log(roomName);
			console.log(roomState[roomName]);
			if (dice !== 1) {
				roomState[roomName].roundScore += dice;
				io.sockets.in(roomName).emit('diceRolled', activePlayer, dice,roomState[roomName]);
			}
			else {
				roomState[roomName].roundScore = 0;
				console.log(roomState[roomName]);
	
				io.sockets.in(roomName).emit('nextPlayer', activePlayer,roomState[roomName]);
				roomState[roomName].activePlayer = activePlayer === 1 ? 2 : 1;
			}
		}
	}

	sock.on('hold', handleHold);
	function handleHold(activePlayer, roomName){
		if(activePlayer == roomState[roomName].activePlayer){
			if(activePlayer == 1){
				roomState[roomName].score1 += roomState[roomName].roundScore;
			}else{
				roomState[roomName].score2 += roomState[roomName].roundScore;
			}
			roomState[roomName].roundScore = 0;

			if(roomState[roomName].score1 >= 100 || roomState[roomName].score2 >= 100){
				io.sockets.in(roomName).emit('gameFinished', activePlayer);
			}else{
				roomState[roomName].activePlayer = activePlayer === 1 ? 2 : 1;
				io.sockets.in(roomName).emit('holdAndNextPlayer', activePlayer,roomState[roomName]);
			}
		}
	}

	sock.on('newGame', handleNewGame);
	function handleNewGame(roomName){
		roomState[roomName].score1 = 0;
		roomState[roomName].score2 = 0;
		roomState[roomName].roundScore = 0;
		roomState[roomName].activePlayer = 1;
		io.sockets.in(roomName).emit('newGameStarted');
	}
});

server.on('error', (err) => {
	console.log(err);
});

server.listen(8080, () => {
	console.log("server is running");
});