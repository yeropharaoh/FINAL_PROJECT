// const RapidAPI = new require('rapidapi-connect');
// const rapid = new RapidAPI('EmotionSpotify', '#########################');
const RapidAPI = require('rapidapi-connect');
const rapid = new RapidAPI('default-application_59a545c8e4b0b28ab0e673f6', '16d6951d-b034-48d5-8bc7-4483efa39522');
var request = require('request'); // "Request" library
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var express = require('express'); // Express web server framework
let bodyParser = require('body-parser');

var client_id = '73d51720077347998724baa1a005f8af' // Your client id
var client_secret ='cc16aec314b74acb80e80cb9b5a254f8' // Your secret
var redirect_uri = 'http://localhost:4000/callback' // Your redirect uri
var stateKey = 'spotify_auth_state'; // default state
var fs = require('fs')
const fileUpload = require('express-fileupload');
 let app = express();

// default options
app.use(fileUpload());

app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static(__dirname + '/public'))
	.use(cookieParser());

app.set('views', './views');
app.set('view engine', 'pug');
app.set('port', (process.env.PORT || 5000));

app.get('/', (request, response)=>{
	response.render('index')
});

app.get('/login', function(req, res) {

var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;

        console.log(access_token);
          
        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          console.log(body);
        });

        // we can also pass the token to the browser to make requests from there
        res.redirect('/emoplaylist?' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
      console.log(access_token);
    });
  }
});


app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

app.get('/emoplaylist', (request, response)=>{
	response.render('emoplaylist')
});

//search
app.post('/search', (request, response)=>{

let imageUrl = request.body.imageurl
let access_token = request.body.access_token
console.log(access_token)
// let accesstoken = JSON.stringify(request.query)
// console.log("This is my access_token "+ accesstoken)
rapid.call('MicrosoftEmotionAPI', 'getEmotionRecognition', { 
  'subscriptionKey': '5ce0c73656fb4464a91deee1e69a1939',
  // 'image': 'fakepath\file'
  // image': 'http://www.goldenglobes.com/sites/default/files/styles/portrait_medium/public/people/cover_images/leonardo_dicaprio-gt.jpg?itok=uZBLZv3X'
  'image': imageUrl

}).on('success', (payload) => {
  // The MicrosoftEmotionAPI returns a confidence score for happiness, sadness, surprise, anger, fear, contempt, disgust or neutral.
  // The emotion detected should be interpreted as the emotion with the highest score, as scores are normalized to sum to one.
  // I built a simple loop to find the emotion detected.
  let scores = payload[0].scores;
  let strongestEmotion = "";
  let emotionScore = 0;
  for (var key in scores) {
    if (scores[key] > emotionScore) {
      emotionScore = scores[key];
      strongestEmotion = key;
    }
  }

console.log(strongestEmotion);


rapid.call('SpotifyPublicAPI', 'searchPlaylists', { 
	'accessToken': access_token,
  
  // strongestEmotion should now equal the emotion detected in the photo
  // 'query': '\'surprise\''
	'query': strongestEmotion,
	'market': '',
  // I limit the results to 1 for simplicity. For this test, I'm just returning the top result
	'limit': '1',
	'offset': ''

  }).on('success', (payload) => {
     // A JSON object is returned containing information about the playlist including the name, URL, and owner.
     // Here I have grabbed the playlist's URL and opened it in the browser using the npm package "open"
	   payload.playlists.items[0].external_urls.spotify;

	
	  // console.log( payload.playlists)
		console.log(request.body.imageurl)
	  response.send({image: request.body.imageurl, playlist: payload.playlists.items[0].href, emotion: strongestEmotion})
  }).on('error', (payload) => {
	   console.log("Spotify Playlist Query Error");
  });
}).on('error', (payload) => {
  console.log("Microsoft Emotion Error");
});
});

app.get('/makemusic', (request, response)=>{
	response.render('makemusic')
});

// app.listen(4000, function() {
//     console.log('Listening on port 4000');
// });

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});