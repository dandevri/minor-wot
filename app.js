var express = require('express');
var includes = require('lodash/includes');

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
  console.log('Received vote from ', req.query.chip);
  if (!includes(votes, req.query.chip)) {
    vote(req.query.chip);
    buttonFeedback('vote', req.query.chip);
    res.send('vote registered on ' + req.query.chip);
    return;
  }
  res.send(req.query.chip + ' has already voted');
});

function vote(id) {
  votes.push(id);

  if (votes.length >= 3) {
    console.log('sufficient votes, skipp current song');
    clearVotes();
  }
}

function buttonFeedback(type, id) {
  switch (type) {
    case 'waiting':
      console.log('send ' + id + ' waiting color');
      break;
    case 'vote':
      console.log('send ' + id + ' vote color');
      break;
    case 'skipp':
      console.log('send ' + id + ' skipp color');
      break;
    default:
      break;
  }
}

function clearVotes() {
  votes = [];
  return votes;
}

app.listen(port, host, function () {
  console.log('Server running', host, ':', port);
});
