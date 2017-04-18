var express = require('express');
var uniq = require('lodash/uniq');

var port = process.env.PORT || '3000';
var host = process.env.HOST || '0.0.0.0';

var app = express();

var votes = [];

app.use(express.static('src'))
  .set('views', 'views')
  .set('view engine', 'ejs');

app.get('/', function (req, res) {
  res.render('index');
});

app.get('/api/vote', function (req, res) {
  console.log('vote from', req.query.chip);
  storeVote(req.query.chip);
  res.send('vote received for ' + req.query.chip);
});

function storeVote(id) {
  votes.push(id);
  votes = uniq(votes);
}

app.listen(port, host, function () {
  console.log('Server running', host, ':', port);
});
