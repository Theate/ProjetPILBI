var http = require('http'); // Import Node.js core module
var fs = require('fs');

/****************************************
  Gestion de l'affichage des pages web
*****************************************/
var response;
function handleRequest(err, data){
  if (err) {
      throw err;
  }
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(data);
  response.end();
}

/****************************************************
  Création du serveur web et Gestion des requetes
*****************************************************/
var server = http.createServer(function (req, res) {

    //check the URL of the current request
    if (req.url == '/') {
      response = res
      fs.readFile('web/index.html', handleRequest);
    }
    else if (req.url == "/student") {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write('<html><body><p>This is student Page.</p></body></html>');
        res.end();
    }
    else if (req.url == "/admin") {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write('<html><body><p>This is admin Page.</p></body></html>');
        res.end();
    }
    else
        res.end('Invalid Request!');
});

/***********************
  Démarrage du serveur
************************/
server.listen(5000); //listen for any incoming requests

/***********************
      Quelques logs
************************/
console.log('Node.js web server at port 5000 is running..')
