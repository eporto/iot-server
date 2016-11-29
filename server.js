//passport,passport-local, body-parser,mongoose,bcryptjs, express-session (https?)
/* requires */
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');


var config = require('./config/env.js');
var Utils = require('./utils/utils.js');
var User = require('./models/User.model.js');
var lobbyConfig = require('./models/Lobby.model.js'); 
var gameConfig = require('./models/Game.model.js'); 
//var db = require('./models/Database.model.js');

var SERVER_PING = 5000;
var gameList = [];
var pingList = [];

var app = express();

mongoose.Promise = global.Promise;
mongoose.connect(config.db);

//CORS (Cross-Origin Resource Sharing)
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
    next();
});

 /*  ================================================================  */
 /*  Server Middleware Initialization                                  */
 /*  ================================================================  */

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


 /*  ================================================================  */
 /*  Server Routing functions                                          */        
 /*  @POST  /app/login                                                 */
 /*  @POST  /app/register                                              */
 /*  @GET   /api/courses                                               */
 /*  @GET   /app/users                                                 */
 /*  ================================================================  */

//login: /app/login, /app/user/login, /user/login ?
//register: /app/register, /app/user/register, /user/register ?

/**
 * APP SERVER MESSAGES
 * @GET msg
 */ 

/*
 var gameSession = {
              id:newLobby._id,
              type:"lobby",
              host:userid,
              players:[{
                id:userid,
                name:plobby.player[0].name,
                course:plobby.player[0].course,
                ping:true}],
              message:null,
              gameid:null,
              isOver:false,
              result:[],
              pingTimeout: function() {
                var timeout = setInterval(function(){
                  Utils.ping(gameSession,timeout);
                },SERVER_PING);
              }
            }
*/

app.post('/app/game', function(req,res) {
  var sessionid = req.body.sessionid;
  var userid = req.body.userid;

  var gameSession = Utils.getGameSession(gameList,sessionid);
 
  if(gameSession !== -1) {
    var len = gameSession.players.length;
    for (let i = 0; i < len;i++) {
      if(gameSession.players[i].id === userid) {
         console.log("Recebi PING de: "+gameSession.players[i].id+"("+gameSession.players[i].ping+")");
        gameSession.players[i].ping = true; //to no jogo ainda!
      }
    }
    res.status(200).json(gameSession);  
  } else {
    res.status(404).json("session_notfound");
  }
 
});

/**
 * APP LOBBY CREATION
 * @Post content : user id, lobby name
 */

app.post('/app/lobby/create', function(req,res) {
  var userid = req.body.userid;
  var lobbyName = req.body.lobbyname;

  var lobby = new lobbyConfig({
    name:lobbyName,
    host:userid
  });
  lobby.player.push(userid);

  lobby.save(function(err,newLobby) {
    if(err) {
      console.log(err);
      res.json({
        status:500,
        message:"creation_failed"  
      });
    }
      else {
        lobbyConfig.findById(newLobby._id).populate({path:'player',select:'name course'}).exec(function(err,plobby) {
            if (err) {
              throw err;
            } 
            var gameSession = {
              id:newLobby._id,
              type:"lobby",
              host:userid,
              players:[{
                id:userid,
                name:plobby.player[0].name,
                course:plobby.player[0].course,
                ping:true}],
              message:null,
              gameid:null,
              isOver:false,
              result:[],
              pingTimeout: function() {
                var timeout = setInterval(function(){
                  Utils.ping(gameSession,timeout);
                },SERVER_PING);
                pingList.push(timeout);
              }
            }

            //gameList = [];
            gameList.push(gameSession);
            gameList[gameList.length-1].pingTimeout();
            res.status(200).json(newLobby);
        });
      }
  });

});

/**
 * APP LIST LOBBY
 * @GET lobby with status == AVAILABLE
 */

app.get('/app/lobby',function(req,res) { 
  lobbyConfig.find({status:"AVAILABLE",player:{$not:{$size:0}}}).populate('player','name').exec(function(err,lobby) {
    if (err) {
      throw err;
    }
    res.status(200).json(lobby);    
  });
});

/**
 * APP LOBBY JOIN
 * @Post content : user id, lobby id
 */


app.post('/app/lobby/', function(req,res) {
  var userid = req.body.userid;
  var lobbyid = req.body.lobbyid;

  lobbyConfig.findById(lobbyid, function(err,lobby) {
    if (err) {
      console.log(err);
      res.status(404).end();
    }
    var isHost = true;
   if (lobby.player.indexOf(userid) === -1) { //não to na sala
      //Utils.sendMessageToSession(gameList,lobbyid,'user_join');
      //Utils.setSessionMessage(gameList[0],Utils.message.lobbyUserRejoin);
      //res.status(200).json({message:"lobby_rejoined"});
      lobby.player.push(userid);
      isHost = false;
    }

        lobby.save((err,lobbyUpdated) => {
          if (err) {
            console.log(err);
            res.status(404).end();
          }
          
         // Utils.setSessionMessage(gameList[0],Utils.message.lobbyUserJoin);
          //Procurar qual o lobby que o jogador entrou
        lobbyConfig.findById(lobbyUpdated._id).populate({path:'player',select:'name course'}).exec((err,lobby) => {
            if (err) {
              throw err;
            } 

            if(!isHost) {
              var gs = Utils.getGameSession(gameList,lobbyid);
              gs.players.push({
                id:userid,
                name:lobby.player[lobby.player.length-1].name,
                course:lobby.player[lobby.player.length-1].course,
                ping:true});
            }
             res.status(200).json(lobby);    
            });
            
        });
    //}
  });
});

/**
 * APP LOBBY GAME START
 * @Post content : lobby id
 */
app.post('/app/lobby/start', function(req,res) {
  var lobbyid = req.body.lobbyid;

  lobbyConfig.findById(lobbyid, function(err,lobby) {
     if (err) {
        throw err;
     }

    var newGame =  new gameConfig();
    /*var gameSession = {
      id:newGame.id,
      players:[],
      message:null,
      pingTimeout: function() {
        var timeout = setInterval(function(){
          Utils.ping(gameSession,timeout);
        },10000);
      }
    }*/
    
    for (let i = 0; i < lobby.player.length;i++) {
     newGame.players.push({id:lobby.player[i]});
     /*gameSession.players.push({id:lobby.player[i]});
     gameSession.players[i].ping = true;*/
    }
   
    lobby.status = "UNAVAILABLE";
    lobby.game = newGame.id;
    lobby.save(function(err,lobbyInGame) {
      if (err) {
        throw err;
      }
      newGame.save(function(err,game) {
        if (err) {
          throw err;
        }

        /*gameSession.message = Utils.message.gameStart;
        gameList = [];
        gameList.push(gameSession);
        gameList[gameList.length-1].pingTimeout();*/
        var gs = Utils.getGameSession(gameList,lobbyid);
        gs.type = "game";
        gs.gameid = lobby.game;
        res.status(200).json("Ok");
      });
    });
  });
});

/**
 * GAME USER SCORE
 * @Post content : userid, gameid, beaconid
 */

app.post('/app/game/score', function(req,res) {
  var userid = req.body.userid;
  var gameid = req.body.gameid;
  var beaconid = req.body.beaconid;

  gameConfig.findById(gameid, function(err,game){
    if(err) console.log("game findbyid error: "+err);

    var len = game.players.length;
    var pos;
    for(pos = 0; pos < len; pos++) {
      if(game.players[pos].id == userid) {
        game.players[pos].beacons.push({id:beaconid,time:new Date()});
        break;
      }
    }

    game.save((err,savedGame) => {
      if(err) console.log("game score: "+err);

      if(savedGame.players[pos].beacons.length >= 1) {     
        var gs = Utils.getGameSessionByGame(gameList,gameid);
        gs.isOver = true;
        gs.result.push(userid);

        var endTime = new Date();
        savedGame.endTime = endTime;
        savedGame.result.push(userid);
        savedGame.status = "GAME_ENDED";

        len = savedGame.players.length;
        for(let i = 0; i < len; i++) {
          savedGame.players[i].gameTime = endTime;
        }
        
        let timeout = Utils.getSessionTimeout(gameList,gameid);
       
        if(timeout !== -1)
          clearTimeout(pingList[timeout]);

          savedGame.save((err,GameOver)=>{
            if(err) console.log(err);

            setTimeout(() => {
              Utils.clearSession(gameList,pingList,gameid);
            },1000*60*5);
            console.log("Game "+gameid+" ended.");
            res.status(200).json("End");
          });

      } else
          res.status(200).json("Beacon Captured");
    });
  });
});

/**
 * GAME OVER
 * @GET content : user scores
 */

app.get('/app/game/gameover/:gameid', function(req,res) {
  gameConfig.findById(req.params.gameid).populate('players.id','name').exec(function(err,game) {
    if (err) {
      console.log(err);
      res.status(404).end();
    } else
        res.status(200).json(game.players);
  });
});

/**
 * APP USER LOGIN
 * @Post content : username, password
 */

app.post('/app/login', function(req,res) {
  var username = req.body.username;
  var password = req.body.password;

  //debug
  console.log(req.body);

  User.getUserByUsername(username, function(err, user){
   	if(err) throw err;
    
   	if(!user){
			//res.status(404);
      res.json({
        "status": 404,
        "message": 'login_failed'
      });
   	
    } else {
   	  User.comparePassword(password, user.password, function(err, isMatch){
        if(err) throw err;
        if(isMatch){
          User.createToken(user.name,function(err, user) {
            /*res.status(200);
            res.json({
              "status": 200,
              "message": 'login_complete',
              "token": Utils.generateToken(25)
            });*/
            res.status(200).json(user);
          });
         
        } else {
         //Acho que utilizar o Http.Status Code para identificar Login Bem Sucedido/Mal Sucedido não é uma boa.
         // res.status(404);
          res.json({
            "status": 404,
            "message": 'login_failed'
          });
        }
   	  });
    }
   });
  });

/**
 *  APP USER REGISTER
 *  @Post content : name, password, course, gender, age 
 */
app.post('/app/register', function(req,res) {  
    var name = req.body.name;
    var password = req.body.password;
    var password2 = req.body.password2;
    var gender = req.body.gender;
    var course = req.body.course;
    var period = req.body.period;

    //Checar se tem algum tipo de erro (a validação é feita totalmente no mobile)
    var newUser = new User({
      name: name,
      password: password,
      gender: gender,
      course: course,
      period: period
    });

    console.log("User: \n"+newUser);
    User.createUser(newUser, function(err, user){
      if(err) {
         console.log(err);
      }
      //res.status(200);
      res.json({
        "status": 200,
        "message": 'signup_complete'
      });
    });
});

//lista-de-cursos
app.get('/api/courses', function(req,res) {
  var gameSession = {
      id:1,
      players:[{id:'a',ping:true},{id:'b',ping:true}],
      message:null,
      pingTimeout:  function() {
          var timeout = setInterval(function() {
            Utils.ping(gameSession, timeout);
          },1000)
      }
    }
   gameSession.pingTimeout();
   
  res.send("Hello");
});

app.get('/app/users', function(req,res) {
  User.listUsers(function(err, users) {
  if(err) throw err;
  res.json(users);
  });
});

/*
app.get('/res/class/:classid/:deckname', function(req,res) {
  deck.loadDeck(req.params.deckname, function(result) {
    res.send(result);
  });
});


app.get('/res/:class/deck', function(req,res) {
  var deckNamesArray =[];
  deck.loadAllDecksByClass(req.params.class, function(result) {
    if (result !== null) {
      var len = result.length;
      for (var i = 0; i < len; i++) {
        deckNamesArray.push(result[i].name);
      }
      res.send(deckNamesArray);
    } else {
      res.send('null');
    }
  });
});


/*  ================================================================  */
/*  Server Setup Variables                                            */
/*  ================================================================  */

/**
 *    Server Setup Variables
 */
var port  = process.env.PORT || 5000;



/**
 *    Node Exit Signals Events
 */
var exit_code = ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
                'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM']

exit_code.forEach(function(element, index, array) {
    process.on(element, function() {
        var d = new Date().toString();
        console.log('[%s]:Received %s.\nNode server stopped.', d.substring(0,d.indexOf('GMT')-1), element);
        process.exit(1);
    });
});

/*  ================================================================  */
/*  Server Start                                                      */
/*  ================================================================  */

/**
 *    Server Initialization
 */
app.listen(port, function() {
    var d = new Date().toString();
    console.log('[%s]:Node server started on port:%d', d.substring(0,d.indexOf('GMT')-1), port);
  });
