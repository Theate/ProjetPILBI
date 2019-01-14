var http = require('http'); // Import Node.js core module
var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
const Influx = require('influx');

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

/*************************************
  Mise en place de la connection DB
**************************************/
const influx = new Influx.InfluxDB('http://redtacos.ddns.net:8086/SENSOR_DATA');

/****************************************
     Gestion requete POST formulaire
*****************************************/
app.post('/weather', function(req, res) {
  var location = req.body.location;
  var webPage = req.body.webPage;
  var data = "";
  location = location.replace(/\s/g, "-");
  console.log("location=" + location);
  console.log("webPage=" + webPage);
  if (webPage == "meteoFrance"){
    data = "http://www.meteofrance.com/recherche/resultats?facet=previsions&" +
    "lieuId=&lieuType=&query=" + location
  }
  if (webPage == "meteoCiel"){
    data = "http://www.meteociel.fr/prevville.php?action=getville&villeid=&" +
    "ville=" + location + "&envoyer=OK";
  }
  res.redirect(data);
  res.end();
});

app.post('/settings', function(req, res) {
  var pseudo = req.body.pseudo;
  var mail = req.body.email;
  console.log("pseudo=" + pseudo);
  console.log("mail=" + mail);
  // var json = "{\npseudo:" + pseudo + ",\nmail:" + mail + "\n}"
  // fs.writeFile('test', json, function(err){
  //   if (err){
  //     throw err;
  //   }
  // });
  res.redirect('back');
  res.end();
});

function printLog(error, stdout, stderr) {
  console.log('stdout : ' + stdout);
  console.log('stderr : ' + stderr);
}

/*
Attention, n'importe qui peut poster cette requete et
tuer les systemes controlables du fermier
*/
app.post('/stop', function(req, res){

    // Kill the controlable-systems manager
    murderer = exec("pkill daemon.py", printLog);

    // send main page in return
    res.redirect('back');
    res.end();
});

app.post('/start', function(req, res){

    // Run the controlable-systems manager
    murder = exec("~/daemon.py", printLog)

    // send main page in return
    res.redirect('back');
    res.end();
});

/****************************************
  Gestion de l'affichage des pages web
*****************************************/
app.get('/', function(req, res){
    // influx.getDatabaseNames().then(names => console.log(names))
    // .catch(error => {console.error(`ERROR : ${err.stack}`)});
    // influx.query('SELECT * FROM temperature')
    // .then(result => {console.log(result)})
    // .catch(error => {console.error(`ERROR : ${err.stack}`)});
	  res.render('index.html');
    res.end();
});

/***********************
  Démarrage du serveur
************************/
app.listen(5000); //listen for any incoming requests

/***********************
      Quelques logs
************************/
console.log('Node.js web server at port 5000 is running..')
