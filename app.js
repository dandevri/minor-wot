var express = require('express');

var port = process.env.PORT || '3000';
var host = process.env.HOST || '0.0.0.0';

var app = express();

var scores = {
  team1: 0,
  team2: 0,
  matchpoints1: 0,
  matchpoints2: 0
};

app.use(express.static('src'))
  .set('views', 'views')
  .set('view engine', 'ejs');

app.get('/', function (req, res) {
  res.render('home');
});

app.get('/api/scored/:team', function (req, res) {
  if(req.params.team === 'team1') {
    scores.team1 = scores.team1 + 1;
  } else {
    scores.team2 = scores.team2 + 1;
  }
console.log(scores);
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(scores));
});

app.listen(port, host, function () {
  console.log('Server running', host, ':', port);
});
