'use strict';

var express = require('express');
var routerApiUsager = express.Router();
// var jwt = require('jsonwebtoken');
var url_base = "http://localhost:8090";
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/travail-pratique', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    poolSize: 10
});


var usagerModels = require('../models/usagerModel').usagerModel;
var commandeModels = require('../models/commandeModel').commandeModel;
var platModels = require('../models/platModel').platModel;
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

routerApiUsager.use(function (req, res, next) {
    console.log(req.method, req.url);
    next();
});

routerApiUsager.route('')
    .post(function (req, res) {
        console.log('création d usager ');
        var nouveauUsager = new usagerModels(req.body);

        nouveauUsager.save(function (err) {
            if (err) throw err;
            res.setHeader('Content-Type', 'application/json');
            res.location(url_base + '/usagers/' + nouveauUsager._id.toString());
            res.status(201).json(nouveauUsager);
        });

    });

routerApiUsager.route('/:usager_id')
    .get(function (req, res) {
        verifierAuthentification(req, function (estAuthentifie, jetonDecode) {
            if (!estAuthentifie) {
                res.status(401).end();
            } else {
                req.jeton = jetonDecode;
                if (jetonDecode.id === req.params.usager_id) {
                    console.log('consultation de usagers :' + req.params.usager_id);
                    if (jetonDecode.id === req.params.usager_id) {
                        usagerModels.findById(req.params.usager_id, function (err, usager) {
                            if (err) throw err;
                            if (usager)
                                res.status(200).json(usager);
                            else
                                res.status(404).end();
                        });
                    }

                } else {
                    res.status(403).end();
                }
            }

        });

    });



routerApiUsager.route('/:usager_id/commandes')
    .post(function (req, res) {
        verifierAuthentification(req, function (estAuthentifie, jetonDecode) {
            if (!estAuthentifie) {
                res.status(401).end();
            } else {
                req.jeton = jetonDecode;
                if (jetonDecode.id === req.params.usager_id) {
                    console.log('création de commande ');
                    var nouvelleCommande = new commandeModels();
                    nouvelleCommande.dateArrivee = req.body.dateArrivee;
                    usagerModels.findById(req.params.usager_id, function (err, usager) {
                        if (err) throw err;
                        nouvelleCommande.Usager = usager;

                        nouvelleCommande.save(function (err) {
                            if (err) throw err;
                            res.setHeader('Content-Type', 'application/json');
                            res.location(url_base + '/usagers/:usager_id/commandes' + nouvelleCommande._id.toString());
                            res.status(201).json(nouvelleCommande);
                        });
                    });

                } else {
                    res.status(403).end();
                }

            }

        });


    });

routerApiUsager.route('/:usager_id/commandes/:commande_id')
    .get(function (req, res) {
        verifierAuthentification(req, function (estAuthentifie, jetonDecode) {
            if (!estAuthentifie) {
                res.status(401).end();
            } else {
                req.jeton = jetonDecode;
                if (jetonDecode.id === req.params.usager_id) {
                    console.log('consultation des commandes:' + req.params.commande_id);
                    commandeModels.findById(req.params.commande_id, function (err, commande) {
                        if (err) throw err;
                        if (commande !== null)
                            res.status(200).json(commande);
                        else
                            res.status(404).end();
                    });
                } else {
                    res.status(403).end();
                }

            }

        });
    })
    .put(function (req, res) {
        verifierAuthentification(req, function (estAuthentifie, jetonDecode) {
            if (!estAuthentifie) {
                res.status(401).end();
            } else {
                req.jeton = jetonDecode;
                if (jetonDecode.id === req.params.usager_id) {
                    commandeModels.findById(req.params.commande_id, function (err, commande) {
                        if (err) throw err;
                        if (commande === null) {
                            console.log('création de la commande no :' + req.params.commande_id);
                            var nouvelleCommande = new commandeModels();
                            nouvelleCommande.dateArrivee = req.body.dateArrivee;

                            usagerModels.findById(req.params.usager_id, function (err, usager) {
                                if (err) throw err;
                                nouvelleCommande.Usager = usager;
                            });
                            nouvelleCommande.save(function (err) {
                                if (err) throw err;
                                res.header('Content-Type', 'application/json');
                                res.status(201).json(nouvelleCommande);
                            });

                        } else {

                            console.log('Modification de la commande no : ' + req.params.commande_id);

                            if (req.body.Livreur === undefined && req.body.Usager === undefined) {
                                commandeModels.findByIdAndUpdate(commande.id, req.body, {
                                    new: true, // Retourne le doc modifié et non pas l'originel
                                    runValidators: true // permet d'éxecuter les validateurs
                                }, function (err, uncommande) {
                                    if (err) throw err;
                                    res.status(200).json(uncommande);
                                });

                            } else {
                                res.status(403).end();
                            }
                        }
                    });
                } else {
                    res.status(403).end();
                }

            }

        });
    })
    .delete(function (req, res) {
        verifierAuthentification(req, function (estAuthentifie, jetonDecode) {
            if (!estAuthentifie) {
                res.status(401).end();
            } else {
                req.jeton = jetonDecode;
                if (jetonDecode.id === req.params.usager_id) {
                    console.log("suppression du de la commande no :" + req.params.commande_id);
                    commandeModels.findByIdAndDelete(req.params.commande_id, function (err, commande) {
                        if (err) throw err;
                        res.status(204).json(commande);
                    });
                } else {
                    res.status(403).end();
                }

            }

        });
    });

routerApiUsager.route('/:usager_id/commandes/:commande_id/livreur')
    .put(function (req, res) {
        verifierAuthentification(req, function (estAuthentifie, jetonDecode) {
            if (!estAuthentifie) {
                res.status(401).end();
            } else {
                req.jeton = jetonDecode;
                if (jetonDecode.id === req.params.usager_id) {
                    commandeModels.findById(req.params.commande_id, function (err, commande) {
                        if (err) throw err;
                        livreurModels.findById(req.body._id, function (err, livreur) {
                            if (commande.Livreur === null) {
                                console.log("création du livreur de la commande no : " + req.params.commande_id);
                                if (err) throw err;
                                commande.Livreur = livreur;
                                commande.save(function (err) {
                                    if (err) throw err;
                                    res.status(201).json(commande);
                                });


                            } else {
                                console.log("modification du livreur de la commande no :" + req.params.commande_id);
                                commande.Livreur = livreur;
                                commande.save(function (err) {
                                    if (err) throw err;
                                    res.status(200).json(commande);
                                });

                            }
                        });
                    });
                } else {
                    res.status(403).end();
                }

            }

        });
    });

routerApiUsager.route('/:usager_id/commandes/:commande_id/plats')
    .get(function (req, res) {
        verifierAuthentification(req, function (estAuthentifie, jetonDecode) {
            if (!estAuthentifie) {
                res.status(401).end();
            } else {
                req.jeton = jetonDecode;
                if (jetonDecode.id === req.params.usager_id) {
                    console.log('consultation des plats de la commandes:' + req.params.commande_id);
                    commandeModels.findById(req.params.commande_id, function (err, commande) {
                        if (err) throw err;


                        if (commande !== null)
                            res.status(200).json(commande.Plats);
                        else
                            res.status(404).end();
                    });
                } else {
                    res.status(403).end();
                }

            }

        });

    });


routerApiUsager.route('/:usager_id/commandes/:commande_id/plats/:plat_id')
    .put(function (req, res) {
        verifierAuthentification(req, function (estAuthentifie, jetonDecode) {
            if (!estAuthentifie) {
                res.status(401).end();
            } else {
                req.jeton = jetonDecode;
                if (jetonDecode.id === req.params.usager_id) {
                    commandeModels.findById(req.params.commande_id, function (err, commande) {
                        if (err) throw err;
                        if (commande.Plats.length === 0) {
                            console.log("création du plats de la commande no : " + req.params.commande_id);
                            platModels.findById(req.params.plat_id, function (err, plat) {
                                if (err) throw err;
                                commande.Plats = plat;
                                commande.save(function (err) {
                                    if (err) throw err;
                                    res.status(200).json(commande);
                                });
                            });

                        } else {
                            console.log("modification du plats de la commande no :" + req.params.commande_id);
                            platModels.findById(req.params.plat_id, function (err, plat) {
                                if (err) throw err;
                                commande.Plats.push(plat);
                                commande.save(function (err) {
                                    if (err) throw err;
                                    res.status(201).json(commande);
                                });
                            });



                        }
                    });
                } else {
                    res.status(403).end();
                }

            }

        });
    })
    .delete(function (req, res) {
        verifierAuthentification(req, function (estAuthentifie, jetonDecode) {
            if (!estAuthentifie) {
                res.status(401).end();
            } else {
                req.jeton = jetonDecode;
                if (jetonDecode.id === req.params.usager_id) {
                    console.log("suppression du plats de la commande no :" + req.params.commande_id);
                    commandeModels.findById(req.params.commande_id, function (err, commande) {
                        if (err) throw err;
                        platModels.findById(req.params.plat_id, function (err, plat) {
                            if (err) throw err;
                            commande.Plats.pull(plat);
                            commande.save(function (err) {
                                if (err) throw err;
                                res.status(204).json(commande);
                            });
                        });

                    });
                } else {
                    res.status(403).end();
                }

            }

        });
    });



module.exports = routerApiUsager;