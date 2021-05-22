var mongoose= require('mongoose');

var platSchema = new mongoose.Schema({

    nom:{
        type: String,
        require: true
    },
    nbrPortions:{
        type: Number,
        require: true
    }

});

module.exports.platModel = mongoose.model('Plat',platSchema);