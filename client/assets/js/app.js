// Init socket
const sock = io();

const initialScreen = document.getElementById("initialScreen");
const afterJoiningScreen = document.getElementById("afterJoiningScreen");
const scoreToWin = document.getElementById("scoreToWin");
const userName = document.getElementById("userName");
const newRoomBtn = document.getElementById("newRoomButton");
const joinRoomBtn = document.getElementById("joinRoomButton");
const roomCode = document.getElementById("roomCodeInput");
const roomCodeOutput = document.getElementById("roomCodeOutput");
const waitingForPlayerTwo = document.getElementById("waitingForPlayerTwo");

var activePlayer;

newRoomBtn.addEventListener('click', newRoom);
joinRoomBtn.addEventListener('click', joinRoom);

function newRoom() {
	if(scoreToWin.value != "" && userName.value != ""){
		sock.emit('newRoom', scoreToWin.value, userName.value);
	}else{
		alert("Score to win and name are required");
	}
}

function joinRoom() {
	const code = roomCode.value;
	if(userName.value != ""){
		sock.emit('joinRoom', code, userName.value);
	}else{
		alert("Name is required");
	}
}

sock.on('newConnection', (text) => {

});

sock.on('roomCode', (text) => {
	roomCodeOutput.textContent = text;
});

sock.on('init', (number, roomState, roomName) => {

	roomCodeOutput.textContent = roomName;

	initialScreen.style.display = "none";
	afterJoiningScreen.style.display = "block";

	gamePlaying = roomState.gamePlaying;
	scores = roomState.scores;
	roundScore = roomState.roundScore;
	activePlayer = number;
	console.log(activePlayer)
	resetBoard(roomState)
});

// this will be fired when 2nd player joins the room
sock.on('startGame', () => {

	// show the buttons
	document.querySelector('.btn-new').style.display = 'block';
	document.querySelector('.btn-roll').style.display = 'block';
	document.querySelector('.btn-hold').style.display = 'block';

	// hide the waiting message
	waitingForPlayerTwo.style.display = "none";
});

document.querySelector('.btn-roll').addEventListener('click', function () {
	sock.emit('diceRoll', activePlayer, roomCodeOutput.textContent);
});

sock.on('diceRolled', (activePlayer, dice, roomState) => {
	beep();
	console.log(activePlayer);
	console.log(dice);
	console.log(roomState);
	var diceDom = document.querySelector('.dice');
	diceDom.style.display = 'block'; //show dice    
	diceDom.src = '/images/dice-' + dice + '.png'; //show dice accrding to generated number
	document.querySelector('#current-' + activePlayer).textContent = roomState.roundScore;
});

document.querySelector('.btn-hold').addEventListener('click', function () {
	sock.emit('hold', activePlayer, roomCodeOutput.textContent);
});

sock.on('nextPlayer', (activePlayer, roomState) => {
	beep();
	activePlayer = activePlayer;
	console.log(activePlayer);
	console.log(roomState);

	activePlayer === 1 ? activePlayer = 2 : activePlayer = 1;
	document.getElementById('current-1').textContent = 0;
	document.getElementById('current-2').textContent = 0;
	document.querySelector('.player-1-panel').classList.toggle('active');
	document.querySelector('.player-2-panel').classList.toggle('active');
	document.querySelector('.dice').style.display = 'none';
});

sock.on('holdAndNextPlayer', (activePlayer, roomState) => {
	beep();
	activePlayer = activePlayer;
	console.log(activePlayer);
	console.log(roomState);

	if(activePlayer == 1){
		document.querySelector('#score-' + activePlayer).textContent = roomState.score1;
	}else{
		document.querySelector('#score-' + activePlayer).textContent = roomState.score2;
	}

	activePlayer === 1 ? activePlayer = 2 : activePlayer = 1;
	document.getElementById('current-1').textContent = 0;
	document.getElementById('current-2').textContent = 0;
	document.querySelector('.player-1-panel').classList.toggle('active');
	document.querySelector('.player-2-panel').classList.toggle('active');
	document.querySelector('.dice').style.display = 'none';
});

sock.on('gameFinished', (activePlayer, roomState) => {

	if(activePlayer == 1){
		document.querySelector('#score-' + activePlayer).textContent = roomState.score1;
	}else{
		document.querySelector('#score-' + activePlayer).textContent = roomState.score2;
	}

	document.querySelector('#name-' + activePlayer).textContent='winner!!';
	document.querySelector('.dice').style.display='none';
	document.querySelector('.btn-roll').style.display = 'none';
	document.querySelector('.player-'+activePlayer+'-panel').classList.add('winner');
	document.querySelector('.player-'+activePlayer+'-panel').classList.remove('active');
});

document.querySelector('.btn-new').addEventListener('click', function () {
	sock.emit('newGame', roomCodeOutput.textContent);
});
sock.on('newGameStarted', (activePlayer) => {
	activePlayer = 1;
	resetBoard();
	document.querySelector('.btn-roll').style.display = 'block';
});

function resetBoard(roomState){
	document.querySelector('.dice').style.display = 'none'; //hides dice on startUp
	document.getElementById('score-1').textContent = '0';
	document.getElementById('current-1').textContent = '0';
	document.getElementById('score-2').textContent = '0';
	document.getElementById('current-2').textContent = '0';
	document.getElementById('name-1').textContent = roomState.name1 != "" ? roomState.name1 : "Player 2";
	document.getElementById('name-2').textContent = roomState.name2 != "" ? roomState.name2 : "Player 2";
	document.querySelector('.player-1-panel').classList.remove('winner');
	document.querySelector('.player-2-panel').classList.remove('winner');
	document.querySelector('.player-1-panel').classList.remove('active');
	document.querySelector('.player-1-panel').classList.add('active');
	document.querySelector('.player-2-panel').classList.remove('active');
}
function beep() {
	var snd = new Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");
	snd.play();
}