
module.exports.generateToken = function (len = 25) {
    var characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var charactersLength = characters.length;
    var randomString = '';
    for (var i = 0; i < len; i++) {
        randomString += characters[Math.floor((Math.random() * (charactersLength)))];
    }
    return randomString;
}

 