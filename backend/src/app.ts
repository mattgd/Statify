import express = require('express'); // Express web server framework
import e = require('express');
//var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const SpotifyWebApi = require('spotify-web-api-node');
const localConfig = require('./local_config');
// const AWS = require('aws-sdk');
// const AWS_TABLE_NAME = 'statify-tokens';

const credentials = {
  clientId : localConfig.spotify.clientId,
  clientSecret : localConfig.spotify.clientSecret,
  redirectUri : 'http://localhost:3000/'
};

export var spotifyApi = new SpotifyWebApi(credentials);

const SPOTIFY_STATE_KEY = 'spotify_auth_state';

// User type for holding user data
type User = {
  id: string,
  accessToken: string,
  refreshToken: string,
  expires: number
}

// Map of state cookies and User objects
const usersDb: {[key: string]: User} = {};

const getUser: (state: string) => User = (state) => usersDb[state];

const registerUser: (user: User) => string = (user) => {
  const state = generateRandomString(16);
  usersDb[state] = user;
  return state;
};

//const index = require('./routes/index');
const tracksRouter = require('./routes/tracks');
const artistsRouter = require('./routes/artists');

// Create a new express application instance
const app: express.Application = express();

// const saveUser = (accessToken: string, refreshToken: string) => {
//   const docClient = new AWS.DynamoDB.DocumentClient();
//   const params = {
//     TableName: AWS_TABLE_NAME,
//     Item: {
//       accessToken,
//       refreshToken
//     }
//   };

//   docClient.put(params, function(err, data) {
//     if (err) {
      
//     } else {
//       console.log('data', data);
//       const { Items } = data;
      
//     }
//   });
// };

const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true
};

app.use(cors(corsOptions))
   .use(cookieParser())
   .use(bodyParser.json())
   .use(bodyParser.urlencoded({ extended: false }));
//app.use(morgan('combined'));

function authMiddleware(req, res, next) {
  const state = req.cookies[SPOTIFY_STATE_KEY];

  if (state) {
    loginUser(state)
    .then(() => next())
    .catch((err: any) => {
      console.error(err);
      res.status(401).json({ 'error': 'Invalid authorization cookie' });
      //next();
    });
  } else {
    // Reset the API connection
    spotifyApi = new SpotifyWebApi(credentials);
    next();
  }
}

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
const generateRandomString = (length: number) => {
  var text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
};

const hasTokenExpired: (user: User) => boolean = (user) => user.expires <= new Date().getTime();

async function loginUser(state: string) {
  const user: User = getUser(state);

  if (!user) {
    Promise.reject('Invalid state cookie.');
    return;
  }

  spotifyApi.setAccessToken(user.accessToken);
  spotifyApi.setRefreshToken(user.refreshToken);

  if (hasTokenExpired(user)) {
    spotifyApi.refreshAccessToken()
    .then(
      (data: any) => {
        console.log('Access token refreshed.');
    
        // Save the access token so that it's used in future calls
        user.accessToken = data.body['access_token'];
        spotifyApi.setAccessToken(user.accessToken);
        Promise.resolve(user);
      },
      (err: any) => {
        console.error('Could not refresh access token', err);
        Promise.reject('Could not refresh access token');
      }
    );
  }

  Promise.resolve(user);
};

app.post('/api/v1/register', (req, res) => {
  const authorizationCode = req.body.authorizationCode;
  if (!authorizationCode) {
    res.status(400).json({ 'error': 'No authorization code provided.' });
    return;
  }

  // Have an authorization code, get an access token
  spotifyApi.authorizationCodeGrant(authorizationCode)
  .then((data: any) => {
    const accessToken = data.body.access_token;
    const refreshToken = data.body.refresh_token;
    const expires = new Date().getTime() + (data.body.expires_in * 1000);

    // Set the access token to use it in later calls
    spotifyApi.setAccessToken(accessToken);
    spotifyApi.setRefreshToken(refreshToken);
    
    spotifyApi.getMe()
    .then((data: any) => {
      const user: User = {
        id: data.body.id,
        accessToken,
        refreshToken,
        expires
      }
  
      const state = registerUser(user);
      res.cookie(SPOTIFY_STATE_KEY, state);
      res.status(201).json({ [SPOTIFY_STATE_KEY]: state });
    })
    .catch((err: any) => {
      console.log(err);
      res.status(500).json({ error: 'Failed to get user data.' });
    });

    // TODO: Reset tokens
  }).catch((err: any) => {
    console.log(err);
    res.status(500).json({ error: 'Failed to register user.' });
  });
});

app.post('/api/v1/verify-token', (req, res) => {
  const state = req.cookies[SPOTIFY_STATE_KEY];
  
  if (state) {
    if (getUser(state)) {
      res.json({ 'success': true });
    } else {
      res.status(401).json({ 'error': 'Invalid state cookie.' });
    }
  } else {
    res.status(400).json({ 'error': 'No state cookie provided.' })
  }
});

app.use('/api/v1/tracks', authMiddleware, tracksRouter);
app.use('/api/v1/artists', authMiddleware, artistsRouter);
//app.use('/', index);

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   var err = new Error('Not Found');
//   err.status = 404;
//   next(err);
// });

// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.json({ error: err.message}); // TODO: Change to 'Internal server error.'
// });

app.listen(5000, function () {
  console.log('Statify listening on port 5000!');
});
