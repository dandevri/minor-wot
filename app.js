// Set dependencies
var Spotify = require('spotify-web-api-node');
var express = require('express');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var request = require('request');
var dotenv = require('dotenv').config();
var includes = require('lodash/includes');
var map = require('lodash/map');
var fetch = require('node-fetch');

// Set port and host variables
var port = process.env.PORT || '3000';
var host = process.env.HOST || '0.0.0.0';

// Set Spotify oAuth credentials and state_key
var CLIENT_ID = process.env.CLIENT_ID;
var CLIENT_SECRET = process.env.CLIENT_SECRET;
var REDIRECT_URI = process.env.REDIRECT_URI;
var STATE_KEY = 'spotify_auth_state';

// Define scopes for API endpoint data
var scopes = ['user-read-currently-playing', 'user-modify-playback-state'];

// Call the spotify-web-api-node package and set credentials
var spotifyApi = new Spotify ({
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  redirectUri: REDIRECT_URI
});

var generateRandomString = function(N) {
  return (Math.random().toString(36)+Array(N).join('0')).slice(2, N+2);
};

// Set default volume
var votes = [];
var volume = 40;

// Set express app and declare all functions
var app = express();
app.use(express.static('src'))
   .use(cookieParser())
   .set('views', 'views')
   .set('view engine', 'ejs')
   .get('/', home)
   .get('/login', login)
   .get('/callback', callback)
   .get('/current', getUsersCurrentlyPlayingTrack)
   .post('/play', startUsersPlayback)
   .post('/pause', pauseUsersPlayback)
   .post('/next', nextUsersTrack)
   .post('/previous', previousUsersTrack)
   .get('/refresh-token', refreshToken)
   .get('/api/volume', changeVolume)
   .get('/api/vote', apiVote);

// Get home view
function home (req, res) {
  res.render('index');
}

function login (req, res) {
  // Generate a random state key
  var state = generateRandomString(16);
  // Set HTTP header with the STATE_KEY and generated string
  res.cookie(STATE_KEY, state);
  // Create authorization URL with the scopes and state in order to receive correct data
  res.redirect(spotifyApi.createAuthorizeURL(scopes, state));
}

function callback (req, res) {
  const { code, state } = req.query;
  var storedState = req.cookies ? req.cookies[STATE_KEY] : null;

// First do state validation
  if (state === null || state !== storedState) {
     res.redirect('/#' +
       querystring.stringify({
         error: 'state_mismatch'
       }));
  // If the state is valid, get the authorization code and pass it on the client
  } else {
     // Clear the cookie that was set
     res.clearCookie(STATE_KEY);
     // Retrieve an access token and a refresh token
     spotifyApi.authorizationCodeGrant(code).then(data => {
       const { expires_in, access_token, refresh_token } = data.body;

       // Set the access token on the API object to use it in later calls
       spotifyApi.setAccessToken(access_token);
       spotifyApi.setRefreshToken(refresh_token);

       // Redirect to current page
       res.redirect('/current');
     });
   }
}

// Get the object currently being played on the user's Spotify account
function getUsersCurrentlyPlayingTrack (req, res) {
   spotifyApi.getUsersCurrentlyPlayingTrack().then(({ body }) => {
     // Render the data to the current view
     res.render('current', { data : body});
   });
 }

// Start a new context or resume current playback on the user's active device
function startUsersPlayback (req, res) {
  spotifyApi.startUsersPlayback().then(({ body }) => {
    res.redirect('/current');
  });
}

// Pause playback on the user's account
function pauseUsersPlayback (req, res) {
  spotifyApi.pauseUsersPlayback().then(({ body }) => {
    res.redirect('/current');
  });
}

// Skips to previous track in user's queue
function nextUsersTrack (req, res) {
  spotifyApi.nextUsersTrack().then(({ body }) => {
    res.redirect('/current');
  });
}

// Skip to user's previous track in queue
function previousUsersTrack (req, res) {
  spotifyApi.previousUsersTrack().then(({ body }) => {
    res.redirect('/current');
  });
}

function changeVolume (req, res) {
  console.log('Received volume ', req.query.direction, ' request');
  if (req.query.direction === 'up') {
    volume += 20;
  } else if (req.query.direction === 'down') {
    volume -= 20;
  } else {
    console.warn('Unknown query passed');
  }

  if (volume > 100) {
    volume = 100;
  } else if (volume < 0) {
    volume = 0;
  }
  setCurrentUsersVolume(volume);
  res.send('Volume will be set to ' + volume);
}

function removeSettings(id) {
  setTimeout(
    function () {
      fetch('http://oege.ie.hva.nl/~palr001/icu/api.php?t=rdc&d=XXXX&td=' + id);
    },
    4000
  );
}

// Request access token from refresh token
function refreshToken (req, res) {
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
}

// Set the volume for the user’s current playback device
function setCurrentUsersVolume (volume) {
  spotifyApi.setCurrentUsersVolume(volume).then(({ body }) => {
  }, (err) => {
    console.log(err);
  });
}

function apiVote (req, res) {
  console.log('Received vote from ', req.query.chip);
  if (!includes(votes, req.query.chip)) {
    buttonFeedback('vote', req.query.chip);
    vote(req.query.chip);
    res.send('vote registered on ' + req.query.chip);
    return;
  }
  res.send(req.query.chip + ' has already voted');
}

function vote(id) {
  votes.push(id);

  if (votes.length >= 3) {
    console.log('sufficient votes, skipp current song');
    buttonFeedback('skip', id, votes);
  }
}

function buttonFeedback(type, id, all) {
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
    case 'skip':
      console.log('send skip color to all subscribed buttons');
      map(all, function (one) {
        fetch('http://oege.ie.hva.nl/~palr001/icu/api.php?t=sdc&d=XXXX&td=' + one + '&c=7CB342')
        .then(fetch('http://oege.ie.hva.nl/~palr001/icu/api.php?t=sqi&d=XXXX')
          .catch(function (err) {
            console.log(err);
          }))
        .then(removeSettings(one))
        .catch(function (err) {
          console.log(err);
        });
      });
      clearVotes();
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
  console.log('Server running on', host, ':', port);
});
