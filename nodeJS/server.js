var http = require('http'); // Import Node.js core module
var express = require('express');
var fs = require('fs');
var path = require('path');

/****************************************
  Gestion de l'affichage des pages web
*****************************************/
var app = express();
app.use(express.static(path.join(__dirname, 'public')));

/****************************************************
  Création du serveur web et Gestion des requetes
*****************************************************/
var server = http.createServer(app);

/****************************************
  Gestion de l'affichage des pages web
*****************************************/
app.get('/', function(req, res){
    res.render('web/index.html');
});

/***********************
  Démarrage du serveur
************************/
app.listen(5000); //listen for any incoming requests

/***********************
      Quelques logs
************************/
console.log('Node.js web server at port 5000 is running..')
