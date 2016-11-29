var gameConfig = require('../models/Game.model.js'); 
var lobbyConfig = require('../models/Lobby.model.js'); 

module.exports.message = {
    gameStart: "game_start",
    gameEnd: "game_end",
    lobbyCreationFail:'creation_failed',
    lobbyUserJoin:'user_joined',
    lobbyUserRejoin:'user_rejoined'
}

module.exports.generateToken = function (len) {
    var characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var charactersLength = characters.length;
    var randomString = '';
    for (var i = 0; i < len; i++) {
        randomString += characters[Math.floor((Math.random() * (charactersLength)))];
    }
    return randomString;
}

//manda msg para todos em uma session especifica
module.exports.sendMessageToSession = function(gameList, sessionID, serverMSG) {
    var len = gameList.length;
    var game;
    for (let i = 0; i < len;i++) {
        if(gameList[i].sessionid = sessionID) {
            game = gameList[i];
            break;
        }
    }
    if (game === undefined) {
        return null;
    }   

    var playerLen = game.players.length;
    for (let i = 0; i < playerLen;i++) {
        game.players[i].message = serverMSG;
    }
}


module.exports.setSessionMessage = function(gameSession, msg) {
    gameSession.message = msg;
}

module.exports.getGameSession = function(gameList,sessionid) {
    var len = gameList.length;
    for (let i = 0; i < len;i++) {
        if(gameList[i].id == sessionid) {
            return gameList[i];
        }
    }
    return -1;
}

module.exports.getGameSessionByGame = function(gameList,gameid) {
    var len = gameList.length;
    for (let i = 0; i < len;i++) {
        if(gameList[i].gameid == gameid) {
            return gameList[i];
        }
    }
    return -1;
}

module.exports.getSessionTimeout = function(gameList,gameid) {
    var len = gameList.length;
    for (let i = 0; i < len;i++) {
        if(gameList[i].gameid == gameid) {
            return i;
        }
    }
    return -1;
}

module.exports.clearSession = function(gameList,pingList,gameid) {
    var len = gameList.length;
    let i;
    for (i = 0; i < len;i++) {
        if(gameList[i].gameid == gameid) {
            break;
        }
    }

    console.log("Lobby "+gameList[i].id+" removed from session");
    gameList.splice(i,1);
    pingList.splice(i,1);
}

module.exports.ping = function(gameSession, timeoutid) {
   var len = gameSession.players.length;
   var removed = [];
   if (len <= 0) {
       clearInterval(timeoutid);
       return;
   }

    for (let i = 0; i < len;i++) {
        if(!gameSession.players[i].ping) { 
            //console.log("Player "+gameSession.players[i].id+" disconnected");
            if(gameSession.type==="lobby")
                lobbyConfig.removeUserFromLobby(gameSession.id,gameSession.players[i].id);
            else 
                gameConfig.removeUserFromGame(gameSession.gameid,gameSession.players[i].id);

            removed.push(i);
        } else {
            gameSession.players[i].ping = false;
        }
    }

    if(removed.length) {
        for (let i = 0; i < removed.length;i++) {
            gameSession.players.splice(removed[i],1); 
        }
    }
}
 