var mongoose= require('mongoose');

var commandeSchema = new mongoose.Schema({
    dateArrivee:{
        type: Date,
        require: true
    },
    Livreur:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Livreur',
        require: false
    },
    Usager:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Usager',
        require: false
    },
    Plats:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Plat',
        require: false
    }],
});

module.exports.commandeModel = mongoose.model('Commande',commandeSchema);