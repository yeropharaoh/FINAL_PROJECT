// const RapidAPI = new require('rapidapi-connect');
// const rapid = new RapidAPI('EmotionSpotify', '#########################');
const RapidAPI = require('rapidapi-connect');
const rapid = new RapidAPI('default-application_59a545c8e4b0b28ab0e673f6', '16d6951d-b034-48d5-8bc7-4483efa39522');

var express = require('express'); // Express web server framework
let bodyParser = require('body-parser');

var client_id = '73d51720077347998724baa1a005f8af' // Your client id
var client_secret ='cc16aec314b74acb80e80cb9b5a254f8' // Your secret

let app = express();

app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static(__dirname + '/public'))

app.set('views', './views');
app.set('view engine', 'pug');


app.get('/', (request, response)=>{
	response.render('index')
});

app.post('/search', (request, response)=>{

let imageUrl = request.body.imageurl

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
  'accessToken': 'BQCVIy0zpPVwmpH4Y-kUWB25XRmbDxiAHFKqAKq6c5gFFmVRjp2MTdexBKLdVFHwJNFOnNQ_SV6zz8YvJbBgdhkcb-5tNEnT8IPdNEDt83JmUojDZ1280Qi2jWwL3Ah0ahVQGw7RtyBrRFvKTGna4OAv-OilcNA',

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
	  response.send({image: request.body.imageurl, playlist: payload.playlists.items[0].href})
  }).on('error', (payload) => {
	   console.log("Spotify Playlist Query Error");
  });
}).on('error', (payload) => {
  console.log("Microsoft Emotion Error");
});


	
});
		







app.listen(4000, function() {
    console.log('Listening on port 4000');
});

