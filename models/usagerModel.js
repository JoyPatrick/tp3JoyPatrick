var mongoose= require('mongoose');

var usagerSchema = new mongoose.Schema({
    nom:{
        type: String,
        require: true
    },
    prenom:{
        type: String,
        require: true
    },
    adresse:{
        type: String,
        require: true
    },
    pseudo:{
        type: String,
        require: true
    },
    motDePasse:{
        type: String,
        require: true
    }
});

module.exports.usagerModel = mongoose.model('Usager',usagerSchema);