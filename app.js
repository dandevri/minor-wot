var Spotify = require('spotify-web-api-node');
var express = require('express');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var request = require('request');
var dotenv = require('dotenv').config();
var includes = require('lodash/includes');
var fetch = require('node-fetch');

var port = process.env.PORT || '3000';
var host = process.env.HOST || '0.0.0.0';

var CLIENT_ID = process.env.CLIENT_ID;
var CLIENT_SECRET = process.env.CLIENT_SECRET;
var REDIRECT_URI = process.env.REDIRECT_URI;
var STATE_KEY = 'spotify_auth_state';

var scopes = ['user-read-currently-playing', 'user-modify-playback-state'];

var spotifyApi = new Spotify ({
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  redirectUri: REDIRECT_URI
});

var generateRandomString = N => (Math.random().toString(36)+Array(N).join('0')).slice(2, N+2);

var votes = [];

var app = express();
app.use(express.static('src'))
  .use(cookieParser())
  .set('views', 'views')
  .set('view engine', 'ejs');

app.get('/', function (req, res) {
  res.render('index');
});

app.get('/login', function (req, res) {
  var state = generateRandomString(16);
  res.cookie(STATE_KEY, state);
  res.redirect(spotifyApi.createAuthorizeURL(scopes, state));
});

app.get('/callback', function (req, res) {
  const { code, state } = req.query;
  const storedState = req.cookies ? req.cookies[STATE_KEY] : null;

  if (state === null || state !== storedState) {
     res.redirect('/#' +
       querystring.stringify({
         error: 'state_mismatch'
       }));
  } else {
     res.clearCookie(STATE_KEY);
     // Retrieve an access token and a refresh token
     spotifyApi.authorizationCodeGrant(code).then(data => {
       const { expires_in, access_token, refresh_token } = data.body;

       // Set the access token on the API object to use it in later calls
       spotifyApi.setAccessToken(access_token);
       spotifyApi.setRefreshToken(refresh_token);

       // use the access token to access the Spotify Web API
       spotifyApi.getMe().then(({ body }) => {
         console.log(body);
       });

       // we can also pass the token to the browser to make requests from there
       res.redirect('/current/#' +
         querystring.stringify({
           access_token: access_token,
           refresh_token: refresh_token
         }));
     }).catch(err => {
       res.redirect('/#' +
         querystring.stringify({
           error: 'invalid_token'
         }));
     });
   }
});

app.get('/current', function (req, res) {
   spotifyApi.getUsersCurrentlyPlayingTrack().then(({ body }) => {
     console.log(body);
     res.render('current', { data : body});
   });
 });

app.post('/play', function (req, res) {
  spotifyApi.startUsersPlayback().then(({ body }) => {
    console.log(body);
    res.redirect('/current');
  });
});

app.post('/pause', function (req, res) {
  spotifyApi.pauseUsersPlayback().then(({ body }) => {
    console.log(body);
    res.redirect('/current');
  });
});

app.post('/next', function (req, res) {
  spotifyApi.nextUsersTrack().then(({ body }) => {
    console.log(body);
    res.redirect('/current');
  });
});

app.post('/previous', function (req, res) {
  spotifyApi.previousUsersTrack().then(({ body }) => {
    console.log(body);
    res.redirect('/current');
  });
});

app.get('/refresh_token', function (req, res) {
  const { refresh_token } = req.query;
  if (refresh_token) {
    spotifyApi.setRefreshToken(refresh_token);
  }
  spotifyApi.refreshAccessToken().then(({body}) =>  {
    res.send({
      'access_token': body.access_token
    })
  }).catch(err => {
    console.log('Could not refresh access token', err);
  });
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
