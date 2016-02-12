// set variables for environment
var express = require('express');
var app = express();
var path = require('path');
var http = require('http');
var https = require('https');
var fs = require('fs');
//var request = require('request');
var rdfstore = require('rdfstore');

//var n3 = require('n3');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// views as directory for all template files
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// instruct express to server up static assets
app.use(express.static('public'));

// set routes
app.get('/login', function(req, res) {
  console.log('Starting process peer certificate..\n');
  var peerCertificate = req.connection.getPeerCertificate();
  var peerPublicKey = getCertificatePublicKey(peerCertificate);
  console.log('Peer is the owner of the public key.\n');

  console.log('Verifying that peer is really ' +
              peerCertificate.subjectaltname + '.\n');
  var remoteProfileURL = getWebIdProfileURL(peerCertificate);
  var remotePublicKey = getRemotePublicKey(remoteProfileURL, peerPublicKey,
                                           peerCertificate, authenticate);

  res.render('index', {subjectName: peerCertificate.subjectaltname,
                       peerKey: printKey(peerPublicKey),
                       remoteKey: ''});
});

function getWebIdProfileURL(certificate) {
  var subjectAltName = certificate.subjectaltname;
  return subjectAltName.split('#')[0].slice(4);
}

function getRemotePublicKey(url, peerPublicKey, certificate, callback) {
  rdfstore.create(function(err, store) {
    var publicKeyList = [];

    var create = 'LOAD <' + url + '> INTO GRAPH <foaf>';
    store.execute(create, function(err) {
      var query = 'SELECT ?modulus ?exponent FROM NAMED <foaf> { GRAPH <foaf>' +
      '{?x <http://www.w3.org/ns/auth/cert#modulus> ?modulus . ' +
      '?x <http://www.w3.org/ns/auth/cert#exponent> ?exponent .}}';

      store.execute(query, function(err, results) {
        var modulus = results[0].modulus.value;
        var exponent = parseInt(results[0].exponent.value).toString(16);
        var remotePublicKey = {'modulus': modulus.toLowerCase(),
                               'exponent': exponent};
        console.log(certificate.subjectaltname +
                    ' public key:\n' + remotePublicKey.modulus + ' : ' +
                    remotePublicKey.exponent + '\n');
        callback(peerPublicKey, remotePublicKey);
      });
    });
  });
}

function getCertificatePublicKey(certificate) {
  var peerPublicKey = {'modulus': certificate.modulus.toLowerCase(),
                       'exponent': parseInt(certificate.exponent, 16).toString(16)};
  console.log('Peer certificate public key:\n' + peerPublicKey.modulus + ' : ' +
              peerPublicKey.exponent + '\n');
  return peerPublicKey;

}

function authenticate(peerPublicKey, remotePublicKey) {
  if (peerPublicKey.modulus === remotePublicKey.modulus &&
      peerPublicKey.exponent === remotePublicKey.exponent) {
    console.log('Authentication OK!');
  } else {
    console.log('Authentication failed. Public keys don\'t match.');
  }
}

function printKey(key) {
  return key.modulus.replace(/(.{2})/g, '$1 ') + ' : ' + key.exponent;
}

// Set server port
var port = 4000;

var httpServer = http.createServer(app);

var privateKey = fs.readFileSync('cert/server.key', 'utf8');
var certificate = fs.readFileSync('cert/server.crt', 'utf8');
var passphrase = 'pellava2';
var credentials = {key: privateKey, cert: certificate, passphrase: passphrase,
                   requestCert: true};

var httpsServer = https.createServer(credentials, app);

httpServer.listen(8080);
httpsServer.listen(8081);

console.log('Server is running https://localhost:8081.\n');
