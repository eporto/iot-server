var mongoose = require('mongoose');

var LobbySchema = mongoose.Schema({
    name: { 
        type:String,
        required: true
    },
    host: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'users'
    },
    status: {
        type:String, //ACTIVE,ENDED
        default: "AVAILABLE"
    },
    game: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'game'
    },
    player: [{type:mongoose.Schema.Types.ObjectId, ref:'users'}],
 });

//Mongoose { options: { pluralization: true } } 
//Wth is that mongoose? But i still love you.
var Lobby = module.exports = mongoose.model('lobby',LobbySchema,'lobby');

module.exports.removeUserFromLobby = function(lobbyid,userid) {
    Lobby.findById(lobbyid, function(err,lobbySession){
        if(err) 
            console.log("Error findById: "+err);
        else {
            var len = lobbySession.player.length;
            for (let i = 0; i < len;i++) {
                if(lobbySession.player[i]==userid) {
                    console.log("Player "+lobbySession.player[i]+" disconnected from Lobby");
                    lobbySession.player.splice(i,1);
                    break;
                } 
            }
        
            if (!lobbySession.player.length) {
                lobbySession.status = "LOBBY_DROP";
            }
            lobbySession.save(function(err,lobbyUpdated){
                if (err) console.log("Error lobby.save(): "+err);
            });
        }
    });
}
/*
{
    "_id": {
        "$oid": "5833270762daf20fa0e51000"
    },
    "name": "Hello",
    "player": [
         {
            "$oid": "581e2d5002228c1e84f18ad9"
         },
        {
            "$oid": "583076e0ea704f2650aff30f"
        },
         {
            "$oid": "581e2d5002228c1e84f18ae1"
        }
       
    ],
    "status": "AVAILABLE",
    "__v": 5
}
*/