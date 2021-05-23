'use strict';

var express = require('express');
var routerApiPlat = express.Router();
// var jwt = require('jsonwebtoken');
var url_base = "https://tp3-joypatricknguefouet.herokuapp.com/";
var cors = require('cors');
var mongoose = require('mongoose');

var jwt = require('jsonwebtoken');

//connecter a mongo atlas
mongoose.connect('mongodb+srv://joypatrick44:<MkzqUv#x6U6PZ!j>@cluster0.ujgxq.mongodb.net/travail-pratique', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    poolSize: 10
});


var platModels = require('../models/platModel').platModel;

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


routerApiPlat.use(function (req, res, next) {
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


// Site qui ont l'autorisation de faire GET sur les plats
const whitelist = ['https://www.delirescalade.com', 'https://www.chess.com', 'https://cegepgarneau.omnivox.ca'];
const corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
};

const issue2options = {
    origin: true,
    methods: ["GET"],
    preflightContinue: false,
    optionsSuccessStatus: 204
};


routerApiPlat.route('')
    .post(function (req, res) {
        console.log('création du plat ');
        var nouveauPlats = new platModels(req.body);
        nouveauPlats.save(function (err) {
            if (err) throw err;
            res.setHeader('Content-Type', 'application/json');
            res.location(url_base + '/plats/' + nouveauPlats._id.toString());
            res.status(201).json(nouveauPlats, [{
                    rel: "self",
                    method: "GET",
                    title: "obtention d'un plat",
                    href: url_base+"/plats/" + nouveauPlats._id.toString()
                },
                {
                    rel: "delete",
                    method: "DELETE",
                    title: "suppression d un plat",
                    href: url_base+"/plats/" + nouveauPlats._id.toString()
                }
            ]);
        });

    })
    .get(cors(corsOptions), function (req, res) {
        console.log('consultation de tous les plats');
        platModels.find({}, function (err, plats) {

            var resBody = [];

            plats.forEach(plat => {
                var link = [{
                        rel: "self",
                        method: "GET",
                        title: "obtenir un plat",
                        href: url_base+"/plats/" + plat._id.toString()
                    },
                    {
                        rel: "delete",
                        method: "DELETE",
                        title: "supprimer un plat",
                        href: url_base+"/plats/" + plat._id.toString()
                    }
                ];
                var platToJson = plat.toJSON();
                var platAvecLink = {
                    person: platToJson,
                    links: link
                };
                resBody.push(platAvecLink);
            });

            if (err) throw err;
            res.json(resBody);
        });
    })
    .options(cors(issue2options));



routerApiPlat.route('/:plat_id')
    .get(function (req, res) {
        console.log('consultation du plats No : ' + req.params.plat_id);
        platModels.findById(req.params.plat_id, function (err, plat) {
            if (err) throw err;
            if (plat)
                res.status(200).json(plat, [{
                    rel: "delete",
                    method: "DELETE",
                    title: "supprimer un plat",
                    href: url_base+"/plats/" + plat._id.toString()
                }]);
            else
                res.status(404).end();
        });
    })
    .delete(function (req, res) {
        console.log("suppression du plat No:" + req.params.plat_id);
        platModels.findByIdAndDelete(req.params.plat_id, function (err, plat) {
            if (err) throw err;
            res.status(204).json(plat);
        });
    });




module.exports = routerApiPlat;