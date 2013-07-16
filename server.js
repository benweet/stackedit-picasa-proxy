var url   = require('url'),
    http  = require('http'),
    https = require('https'),
    fs    = require('fs'),
    express = require('express'),
    qs    = require('querystring');

// Load config defaults from JSON file.
// Environment variables override defaults.
function loadConfig() {
  var config = JSON.parse(fs.readFileSync(__dirname+ '/config.json', 'utf-8'));
  for (var i in config) {
    config[i] = process.env[i.toUpperCase()] || config[i];
  }
  console.log('Configuration');
  console.log(config);
  return config;
}

var config = loadConfig();
var app = express();

// Convenience for allowing CORS on routes - GET only
app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*'); 
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS'); 
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Slug');
  next();
});

app.options('/upload/:album', function(req, res) {
	res.end("OK");
});

app.post('/upload/:album', function(req, res) {
	console.log("/upload/:album");
	var album = req.params.album;
	console.log("album: " + album);
	var connection = https.request({
		host: 'picasaweb.google.com',
		path: "/data/feed/api/user/default/albumid/" + album,
		method: 'POST',
		headers: {
    		'Authorization': req.headers['authorization'],
    		'Content-Type': req.headers['content-type'],
    		'Slug': req.headers['slug'],
      	}
	}, function(response) {
		response.pipe(res);
	});
	connection.on("error", function(err) {
		res.json(err);
	});
	req.pipe(connection);
});

var port = process.env.PORT || config.port || 9998;

app.listen(port, null, function (err) {
	console.log('Server started: http://localhost:' + port);
});
