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
            var len = game.players;
            for (let i = 0; i < len;i++) {
                if(game.players[i].id === userid) {
                    game.players[i].gameTime = new Date();
                    break;
                }
            }
            game.save(function(err,game){
                if (err) throw err;
            });
        }
    });
}