//passport,passport-local, body-parser,mongoose,bcryptjs, express-session (https?)
/* requires */
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');


var config = require('./config/env.js');
var Utils = require('./utils/utils.js');
var User = require('./models/User.model.js');
var db = require('./models/Database.model.js');

var app = express();

mongoose.Promise = global.Promise;
mongoose.connect(config.db);
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
 /*  ================================================================  */

//login: /app/login, /app/user/login, /user/login ?
//register: /app/register, /app/user/register, /user/register ?

/**
 * APP USER LOGIN
 * @Post content : username, password
 */

app.post('/app/login', function(req,res) {
  var username = req.body.username;
  var password = req.body.password;

  //console.log(req.body);

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
            res.status(200);
            res.json({
              "status": 200,
              "message": 'login_complete',
              "token": Utils.generateToken()
            });
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
         throw err;
      }
      //res.status(200);
      res.json({
        "status": 200,
        "message": 'register_complete'
      });
    });
});

//lista-de-cursos
app.get('/api/courses', function(req,res) {
  res.send("Hello");
});

app.get('/app/users', function(req,res) {
  console.log("Recebi Get");
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
