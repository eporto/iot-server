var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var Utils = require('../utils/utils.js');

var UserSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    course: {
        type: String,
        required: true
    },
    period: Number,
    token: String
 });

var User = module.exports = mongoose.model('User',UserSchema);



module.exports.createUser = function(newUser, callback){
	//bcrypt tirado exatamente igual do github/bycriptjs
	//criptografia: salt é um dado randomico criado para ser inserido junto a uma senha (concatenado) e em cima disso ser gerado o hash
	bcrypt.genSalt(10, function(err, salt) {
	    bcrypt.hash(newUser.password, salt, function(err, hash) {
	        newUser.password = hash;
	        newUser.save(callback);
	    });
	});
}

module.exports.getUserByUsername = function(username, callback){
	var query = {name: username};
	User.findOne(query, callback);
}

module.exports.getUserById = function(id, callback){
	User.findById(id, callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    	if(err) throw err;
    	callback(null, isMatch);
	});
}

module.exports.createToken = function(username,callback) {
    var query = { name: username };
    var token = Utils.generateToken(25);
    User.findOneAndUpdate(query, { token: token }, callback);
}

module.exports.listUsers = function(callback) {
    User.find({},callback);
}
//module.exports = User;
//mongoose.disconnect(); <---------- 
//mongoose.connection.close();
/* IONIC
verificar se tem um arquivo no localStorage chamado Session (que tem as credenciais do usuario) {logado}
se não tiver -> abre tela de login
se tiver -> já entra na app (dados no arquivo)

-------------//
Provider : Service
    Ele quem vai fazer as requisições HTTP

    LoginPage
        user.getUser(username, passw)

    @Injectable()
    LoginService (Provider)
        getuser(u,p) {
            http.post
        }

-------------//
SERVER-PHP

criou uma função que cria uma strRandom (len:10)
usa a strRandom como token do usuário (Tabela tem um campo pra Token [id,nome,pass,token]) -> usa um update query pra inserir a token
Retorna um objeto com {nome, token} (capturado pelo AppMobile)
AppMobile ao recebe esse objeto (Auth = Ok) salva no dispositivo (localstorage) dois arquivos chave-valor (name: 'nome e token: 'token'')
Sempre que o AppMobile rodar a primeira coisa (ionviewwillenter) que ele faz é verificar se existe um arquivo com uma token setada, se sim -> loga automatico, se não -> abre tela login/registrar

-------------//
ionViewLoaded works the same way as ngOnInit, fires once when the view is initially loaded into the DOM
ionViewWillEnter and ionViewDidEnter are hooks that are available before and after the page in question becomes active
ionViewWillLeave and ionViewDidLeave are hooks that are available before and after the page leaves the viewport
ionViewWillUnload and ionViewDidUnload are hooks that are available before and after the page is removed from the DOM        

----------//
res.json ({
    sucess: true/false
    message: 'Error' / 'Success'
    user: user
    token: token-generated
})
*/


/*
iot-server(Folder)
    -config
    -model
    -views
    */