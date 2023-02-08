const mongoose = require('mongoose')
const user = new mongoose.Schema({
    email:{type:String,unique: true },
    password:{type:String },
    authToken: {type:String}
});


module.exports = mongoose.model('user',user);

