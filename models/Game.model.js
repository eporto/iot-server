var mongoose = require('mongoose');

var GameSchema = mongoose.Schema({
   players: [{
        id: {
            type:mongoose.Schema.Types.ObjectId,
            ref:'users'
        },
        beacons: [{ 
            id: Number,
            time: Date 
        }],
        gameTime: Date
   }],
   result:[{ 
       type:mongoose.Schema.Types.ObjectId, 
       ref:'users'
    }],
    startTime: {
        type: Date,
        default: Date.now
    },
    endTime: Date,
    status: {
        type:String,
        default:"IN_PROGRESS"
    }  
 });


var Game = module.exports = mongoose.model('game',GameSchema,'game');

module.exports.removeUserFromGame = function(gameid,userid) {
    Game.findById(gameid, function(err,game){
        if(err) 
            console.log("Error Game findById: "+err);
        else {
            let isOver = true;
            var len = game.players.length;
            for (let i = 0; i < len;i++) {
                if(game.players[i].id == userid) {
                    game.players[i].gameTime = new Date();
                    console.log("Player "+game.players[i].id+" disconnected from Game");
                    break;
                }
            }

            for(let i = 0; i < len; i++) {
                if(!game.players[i].gameTime) {
                    isOver = false;
                     break;
                }          
            }
            if(isOver) {
                game.status = "GAME_DROP";
            }
            game.save(function(err,game){
                if (err) console.log("Erro RemoveUserFromGame (save): "+err)
            });
        }
    });
}