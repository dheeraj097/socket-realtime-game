module.exports = {
    initRoom,
}

function initRoom() {
    const state = createRoomState()
    return state;
}

function createRoomState(){
    return {
        gamePlaying:true,
        activePlayer:1,
        name1:"",
        name2:"",
        scoreToWin:0,
        score1:0,
        score2:0,
        roundScore:0
    }
}