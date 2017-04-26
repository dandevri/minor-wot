var express = require('express');
var includes = require('lodash/includes');
var fetch = require('node-fetch');

var port = process.env.PORT || '3000';
var host = process.env.HOST || '0.0.0.0';

var app = express();

var votes = [];
var volume = 50;

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
      fetch('http://oege.ie.hva.nl/~palr001/icu/api.php?t=sdc&d=XXXX&td=' + id + '&c=ff0000')
        .then(fetch('http://oege.ie.hva.nl/~palr001/icu/api.php?t=sqi&d=XXXX')
          .catch(function (err) {
            console.log(err);
          }))
        .then(removeSettings(id))
        .catch(function (err) {
          console.log(err);
        });
      break;
    case 'skipp':
      console.log('send ' + id + ' skipp color');
      break;
    default:
      break;
  }
}

app.get('/api/volume', function (req, res) {
  console.log('Received volume ', req.query.direction, ' request');
  if (req.query.direction === 'up') {
    volume += 10;
  } else if (req.query.direction === 'down') {
    volume -= 10;
  } else {
    console.warn('Unknown query passed');
  }

  if (volume > 100) {
    volume = 100;
  } else if (volume < 0) {
    volume = 0;
  }

  res.send('Volume will be set to ' + volume);
});

function removeSettings(id) {
  setTimeout(
    function () {
      fetch('http://oege.ie.hva.nl/~palr001/icu/api.php?t=rdc&d=XXXX&td=' + id);
    },
    4000
  );
}

function clearVotes() {
  votes = [];
  return votes;
}

app.listen(port, host, function () {
  console.log('Server running', host, ':', port);
});
