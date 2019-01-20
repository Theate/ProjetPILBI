var http = require('http'); // Import Node.js core module
var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var secret = "MeilleurMotDePasseDuMonde";
const Influx = require('influx');
let jwt = require('jsonwebtoken');
var cookieParser = require('cookie-parser');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

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
app.use(cookieParser());
var server = http.createServer(app);

/*************************************
  Mise en place des connection BD
**************************************/
const influx = new Influx.InfluxDB('http://localhost:8086/CONTROLLABLE_SYSTEMS');
let sqlite = new sqlite3.Database('database.sqlite')

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

//Gestion de la modification des password et login
app.post('/settings', function(req, res) {
  var pseudo = req.body.pseudo;
  var mdp = req.body.mdp;
  if (req.cookies.token) {
    jwt.verify(req.cookies.token, secret, (error, authorizedData) => {
      if (error) {
        res.redirect('/');
      } else {
        if (pseudo == "") {
          pseudo = authorizedData.username
        }
        sqlite.get("SELECT * FROM users WHERE username == ?", [pseudo], (error2, row) => {
          var original = authorizedData.username;
          if (row && pseudo !== original) {
            res.render('index.html', {username: authorizedData.username, isAdmin: authorizedData.isAdmin, badLoginRename: true});
          } else {
            
            if (mdp == "") {
              sqlite.run("UPDATE \"users\" SET \"username\" = ? WHERE \"username\" = ?", [pseudo, original]);
            } else {
              bcrypt.hash(mdp, 10, function(err, hash) {
                sqlite.run("UPDATE \"users\" SET \"username\" = ?, \"password\" = ? WHERE \"username\" = ?", [pseudo, hash, original]);
              });
            }
            res.clearCookie("token");
            res.render('login.html', {message: "Identifiants changés avec succès"});
          }
        });
      }
    })
  } else {
    res.redirect('/');
  }
});

// Affichage dans les traces du serveur des logs des processus fils (exec)
// function printLog(error, stdout, stderr) {
//   console.log('stdout : ' + stdout);
//   console.log('stderr : ' + stderr);
// }

// Active l'irragtion de la station passées en parametres de la requete
app.post('/startWatering', function(req, res){
  var station = req.body.value;
  // Start the corresponding station
  influx.writePoints([
    {
      measurement:'watering',
      tags: { id_station:station },
      fields: { value:1 },
    }
  ])
  .then(function(result){
    res.json("{'success':1}");
    res.end();
  })
  .catch(error => {console.error(`ERROR : ${err.stack}`)});
});

// stop l'irrigation de la station passée en paramètre
app.post('/stopWatering', function(req, res){
  var station = req.body.value;
  // Stop the corresponding station
  influx.writePoints([
    {
      measurement:'watering',
      tags: { id_station:station },
      fields: { value:0 },
    }
  ])
  .then(function(result){
    res.json("{'success':1}");
    res.end();
  })
  .catch(error => {console.error(`ERROR : ${err.stack}`)});
});

// app.post('/stop', function(req, res){
//
//     // Kill the controlable-systems manager
//     murderer = exec("pkill daemon.py", printLog);
//
//     // send main page in return
//     res.redirect('back');
//     res.end();
// });
//
// app.post('/start', function(req, res){
//
//     // Run the controlable-systems manager
//     murder = exec("~/daemon.py", printLog)
//
//     // send main page in return
//     res.redirect('back');
//     res.end();
// });

/****************************************
  Gestion de l'affichage des pages web
*****************************************/

// demande d'affichage de index.html
// Si non connecté => page de login
app.get('/', function(req, res){
    if (req.cookies.token) {
      jwt.verify(req.cookies.token, secret, (error, authorizedData) => {
        if (error) {
          res.render('login.html', {message: "Erreur d'authentification"});
        } else {
          res.render('index.html', {username: authorizedData.username, isAdmin: authorizedData.isAdmin});
        }
      })
    } else {
	    res.render('login.html', {message: "Identifiez-vous pour accéder à l'application"});
    }
});

// Authentification obligatoire
app.post('/login', function(req, res){
  let username = req.body.login
  let password = req.body.mdp
  if (username && password) {
    sqlite.get("SELECT * FROM users WHERE username == ?", [username], (error, row) => {
      if (row) {
        bcrypt.compare(password, row.password, function(err, compareResult) {
          if (compareResult) {
            let token = jwt.sign({username: username, isAdmin: row.is_admin}, secret);
            res.cookie('token', token)
              .redirect('/');
          } else {
            res.render('login.html', {message: "Mot de passe ou identifiant incorrect"});
          }
        })
      } else {
        res.render('login.html', {message: "Mot de passe ou identifiant incorrect"});
      }
    })
  } else {
    res.render('login.html', {message: "Remplissez les champs login et mot de passe pour vous authentifier"});
  }
});

// page de création de compte pour les admin
app.get('/register', function(req, res) {
  if (req.cookies.token) {
    jwt.verify(req.cookies.token, secret, (error, authorizedData) => {
      if (error || !authorizedData.isAdmin) {
        res.redirect('/');
      } else {
        res.render('register.html', {message: 'Remplissez les champs pour ajouter un compte'});
      }
    })
  } else {
    res.redirect('/');
  }
});

// admin créé un nouveau compte
app.post('/register', function(req, res) {
  if (req.cookies.token) {
    jwt.verify(req.cookies.token, secret, (error, authorizedData) => {
      if (error || !authorizedData.isAdmin) {
        res.redirect('/');
      } else {
        let username = req.body.login
        let password = req.body.mdp
        let passwordConf = req.body.mdpconf
        let isAdmin = req.body.isAdmin == "true"
        if (password != passwordConf) {
          res.render('register.html', {message: 'Erreur: les deux mots de passe ne correspondent pas'});
        } else {
          sqlite.get("SELECT * FROM users WHERE username == ?", [username], (error, row) => {
            if (row) {
              res.render('register.html', {message: 'Erreur: il existe déjà un compte avec ce login'});
            } else {
              bcrypt.hash(password, 10, function(err, hash) {
                sqlite.run("INSERT INTO \"users\" (\"username\", \"password\", \"is_admin\") VALUES (?, ?, ?)", [username, hash, isAdmin], (error) => {
                  res.render('register.html', {message: 'Compte créé avec succès'});
                })
              });
            }
          })
        }
      }
    })
  } else {
    res.redirect('/');
  }
});

var connections = [] // pool de connections actives
var controlablesCurrentStates = {};
var modifiedControlables = [];

// requete "Server Send Event" du package express-sse
function sseSend(res, data){
  res.write("data: " + JSON.stringify(data) + "\n\n");
}

// ouverture d'une connection pour l'envoi d'evenement en frontend
app.get('/stream', function(req, res) {

  // On initialise la valeur 'controlablesCurrentStates'
  influx.query('select id_station,last(value) from watering group by id_station;')
  .then(function(result){
    controlablesCurrentStates = JSON.stringify(result);
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });
    sseSend(res, "{'success':1}");
    connections.push(res);

    // On active la sous routine qui verifie si il y a eu un changement d'état
    // des systèmes contrôlables et génère un evenement en frontend le cas échéant
    //    Pour déterminer si il y a eu un changement, on compare avec la valeur
    //    précédente des systèmes à savoir : 'controlablesCurrentStates'
    setInterval(daemon, 5*1000);
  })
  .catch(error => {console.error(`ERROR : ${err.stack}`)});
})

// Verifie si il y a eu un changement d'état des systèmes contrôlables et
// génère un evenement en frontend le cas échéant.
//    Pour déterminer si il y a eu un changement, on compare avec la valeur
//    précédente des systèmes à savoir : 'controlablesCurrentStates'
function getControlableSystemsState(){
  var updatedValues;

  influx.query('select id_station,last(value) from watering group by id_station;')
  .then(function(result){
    updatedValues = JSON.stringify(result);

    let previous = JSON.parse(controlablesCurrentStates);
    let current = JSON.parse(updatedValues);

    // console.log("on avait : " + controlablesCurrentStates);
    // console.log("on a : " + updatedValues);
    // console.log(current[1]["last"] != previous[1]["last"]);
    controlablesCurrentStates = updatedValues;
    // console.log("now : " + controlablesCurrentStates);

    // Pour tous les systèmes contrôlables on regarde si l'état à changé
    for (let station = 0; station < previous.length; station++){
      // updatedValues.hasOwnProperty(name)
      if (current[station]["last"] != previous[station]["last"]){
        // console.log("real time : " + "id_station" + previous[station]["id_station"] + " --> " + current[station]["last"]);
        modifiedControlables.push("id_station" + previous[station]["id_station"] + "#value" + current[station]["last"]);
      }
    }
  })
  .catch(error => {console.error(`ERROR : ${err.stack}`)});
}

// daemon génère évènement si 'getControlableSystemsState' a montré des
// modifications des états des systèmes contrôlables
function daemon(){

  getControlableSystemsState();
  var data = modifiedControlables;

  if (modifiedControlables.length > 0) {
    for (let i=0; i<connections.length; i++){
      sseSend(connections[i], data);
    }
  }

  modifiedControlables = []; // reset variable
}

// renvoit l'état actuel des systèmes d'irrigation
app.get('/irrigation', function(req, res){
  influx.query('select id_station,last(value) from watering group by id_station;')
  .then(function(result){
    res.json(JSON.stringify(result));
    res.end();
  })
  .catch(error => {console.error(`ERROR : ${err.stack}`)});
});

// renvoit le mode actuel du système (manuel:0 ou auto:1)
app.get('/mode', function(req, res){
  influx.query('select last(value) from mode;')
  .then(function(result){
    var mode = JSON.parse(JSON.stringify(result))[0].last;
    res.json(JSON.stringify(mode));
    res.end();
  })
  .catch(error => {console.error(`ERROR : ${err.stack}`)});
});

// modifie en base de données le mode du système (manuel:0 ou auto:1)
app.post('/changeMode', function(req, res){
  var mode = 0;
  if (req.body.value == '1') {
    mode = 1;
  };
  influx.writePoints([
    {
      measurement:'mode',
      tags: { tag:'mode' },
      fields: { value:mode },
    }
  ])
  .then(function(result){
    res.json("{'success':1}");
    res.end();
  })
  .catch(error => {console.error(`ERROR : ${err.stack}`)});
});
/***********************
  Démarrage du serveur
************************/
app.listen(5000); //listen for any incoming requests

/***********************
      Quelques logs
************************/
console.log('Node.js web server at port 5000 is running..')
