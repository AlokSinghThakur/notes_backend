const mongoose = require('mongoose')
const note = new mongoose.Schema({
    desc:{type:String},
    title:{type:String},
    

});

module.exports = mongoose.model('note',note);