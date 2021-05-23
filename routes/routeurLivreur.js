'use strict';

var express = require('express');
var routerApiLivreur = express.Router();
// var jwt = require('jsonwebtoken');
var url_base = "https://tp3-joypatricknguefouet.herokuapp.com/";
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');

//connecter a mongo atlas
mongoose.connect('mongodb+srv://joypatrick44:<GYxb4NSEBYQ1QF0A>@cluster0.ujgxq.mongodb.net/travail-pratique', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    poolSize: 10
});


var livreurModels = require('../models/livreurModel').livreurModel;

function verifierAuthentification(req, callback) {
    // Récupération du jeton JWT dans l'en-tête HTTP "Authorization".
    var auth = req.headers.authorization;
    if (!auth) {
        // Pas de jeton donc pas connecté.
        callback(false, null);
    } else {
        // Pour le déboggae.
        console.log("Authorization : " + auth);
        // Structure de l'en-tête "Authorization" : "Bearer jeton-jwt"
        var authArray = auth.split(' ');
        if (authArray.length !== 2) {
            // Mauvaise structure pour l'en-tête "Authorization".
            callback(false, null);
        } else {
            // Le jeton est après l'espace suivant "Bearer".
            var jetonEndode = authArray[1];
            // Vérification du jeton.
            jwt.verify(jetonEndode, req.app.get('jwt-secret'), function (err, jetonDecode) {
                if (err) {
                    // Jeton invalide.
                    callback(false, null);
                } else {
                    // Jeton valide.
                    callback(true, jetonDecode);
                }
            });
        }
    }
}

routerApiLivreur.use(function (req, res, next) {
    verifierAuthentification(req, function (estAuthentifie, jetonDecode) {
        if (!estAuthentifie) {
            // Utilisateur NON authentifié.
            res.status(401).end();
        } else {
            // Utilisateur authentifié.
            // Sauvegarde du jeton décodé dans la requête pour usage ultérieur.
            req.jeton = jetonDecode;
            // Pour le déboggage.
            console.log("Jeton : " + JSON.stringify(jetonDecode));
            // Poursuite du traitement de la requête.
            next();
        }
    });
});


routerApiLivreur.route('')
.post(function (req, res) {
    console.log('création de Livreur ');
    var nouveauLivreur = new livreurModels(req.body);

    nouveauLivreur.save(function (err) {
        if (err) throw err;
        res.setHeader('Content-Type', 'application/json');
        res.location(url_base+'/livreurs/' + nouveauLivreur._id.toString());
        res.status(201).json(nouveauLivreur);
    });

});

routerApiLivreur.route('/:livreur_id')
    .get(function (req, res) {
        console.log('consultation du livreurs: ');
        livreurModels.findById(req.params.livreur_id, function (err, livreur) {
            if (err) throw err;
            if (livreur)
                res.status(200).json(livreur);
            else
                res.status(404).end();
        });
    })
    .delete(function (req, res) {
        console.log("suppression du livreur No:" + req.params.livreur_id);
        livreurModels.findByIdAndDelete(req.params.livreur_id, function (err, livreur) {
            if (err) throw err;
            res.status(204).json(livreur);
        });
    });




module.exports = routerApiLivreur;