var mongoose= require('mongoose');

var livreurSchema = new mongoose.Schema({
    nom:{
        type: String,
        require: true
    },
    prenom:{
        type: String,
        require: true
    },
    voiture:{
        type: String,
        require: true
    },
    quartier:{
        type: String,
        require: true
    }
});

module.exports.livreurModel = mongoose.model('Livreur',livreurSchema);