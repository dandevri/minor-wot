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
  res.render('index', scores);
});

app.get('/api/scored/:team', function (req, res) {
  if (req.params.team === 'team1') {
    scores.team1 += 1;
  } else {
    scores.team2 += 1;
  }

  if (scores.team1 === 10) {
    scores.matchpoints1 += 1;
    scores.team1 = 0;
    scores.team2 = 0;
  } else if (scores.team2 === 10) {
    scores.matchpoints2 += 1;
    scores.team1 = 0;
    scores.team2 = 0;
  }

  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(scores));
});

app.listen(port, host, function () {
  console.log('Server running', host, ':', port);
});
