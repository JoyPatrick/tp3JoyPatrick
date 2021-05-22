'use strict';
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json());

// Module pour JWT.
var jwt = require('jsonwebtoken');

var routerLivreur = require('./routes/routeurLivreur.js');
var routerUsager = require('./routes/routeurUsager.js');
var routerPlats = require('./routes/routeurPlats.js');

var hateoasLinker = require('express-hateoas-links');

var swaggerUi = require('swagger-ui-express'),
    swaggerDocument = require('./swagger.json');





// Paramètres de configuration généraux.
var config = require('./config');
const { usagerModel } = require('./models/usagerModel.js');

// Ajout d'une variable globale à l'application.
app.set('jwt-secret', config.secret);

// Route pour l'authentification (connexion).
app.post('/connexion', function (req, res) {
    // Vérification des informations d'authentification.

    usagerModel.find({
        pseudo : req.body.pseudo,
        motDePasse: req.body.motDePasse
    },function(err, ressource){
        if(err) throw err;
        if(ressource[0] !== undefined){
            var payload = {
                id:ressource[0].id,
                user:ressource[0].pseudo
            };
            var jwtToken = jwt.sign(payload, app.get('jwt-secret'), {
                // Expiration en secondes (24 heures).
                expiresIn: 86400
                // Permet de vérifier que le jeton expire très rapidement.
                //expiresIn: 10
            });
            res.setHeader('Content-Type', 'application/json');
            res.status(201).json({"token": jwtToken});
        }
        else{
            res.status(400).end();
        }
    });
  
});




app.use(hateoasLinker);

app.use('/livreurs', routerLivreur);
app.use('/plats', routerPlats);
app.use('/usagers', routerUsager);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.all('*', function (req, res) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.status(404).send('Erreur 404 : Ressource inexistante !');
});


var port = process.env.PORT || 8090;
app.listen(port, function () {
    console.log('Serveur Node.js à l\'écoute sur le port %s ', this.address().port);
});