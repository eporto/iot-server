function Database() {
    const connect_string = 'mongodb://rootshido:admin130588@ds011495.mlab.com:11495/hearthstone';
}

Database.prototype.registerUser = function(UserModel, callback) {
    mongoose.connect(this.connect_string);
    UserModel.save(function(err,user) {
        if (err) console.log(err);
        else {
            mongoose.disconnect();
            callback();
        }
    }); 
    
}

module.exports = new Database();