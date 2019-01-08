var http = require('http'); // Import Node.js core module
var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var path = require('path');

/***************************
  Création du serveur web
****************************/
var app = express();
app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/public/web');
app.engine('html', require('ejs').renderFile);
// app.set('view engine', 'html');
// app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
var server = http.createServer(app);

/****************************************
     Gestion requete POST formulaire
*****************************************/
app.post('/post.html', function(req, res) {
  var pseudo = req.body.pseudo;
  var mail = req.body.email;
  console.log("pseudo=" + pseudo);
  console.log("mail=" + mail);
  res.render('index.html');
});

/****************************************
  Gestion de l'affichage des pages web
*****************************************/
app.get('/', function(req, res){
    res.render('index.html');
});

/***********************
  Démarrage du serveur
************************/
app.listen(5000); //listen for any incoming requests

/***********************
      Quelques logs
************************/
console.log('Node.js web server at port 5000 is running..')
