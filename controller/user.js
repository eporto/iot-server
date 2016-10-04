var User = require('./models/User.model.js');


module.exports.createUser = function(newUser, callback){
	//bcrypt tirado exatamente igual do github/bycriptjs
	//criptografia: salt é um dado randomico criado para ser inserido junto a uma senha (concatenado) e em cima disso ser gerado o hash
    mongoose.connect(connect_string);
	bcrypt.genSalt(10, function(err, salt) {
	    bcrypt.hash(newUser.password, salt, function(err, hash) {
	        newUser.password = hash;
	        newUser.save(callback);
	    });
	});
}

module.exports.getUserByUsername = function(username, callback){
	var query = {username: username};
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
