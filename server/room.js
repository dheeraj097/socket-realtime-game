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
        score1:0,
        score2:0,
        roundScore:0
    }
}