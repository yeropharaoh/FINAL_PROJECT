// const RapidAPI = new require('rapidapi-connect');
// const rapid = new RapidAPI('EmotionSpotify', '#########################');
const RapidAPI = new require('rapidapi-connect');
const rapid = new RapidAPI('default-application_59a545c8e4b0b28ab0e673f6', '16d6951d-b034-48d5-8bc7-4483efa39522');

let imageUrl = getElementById('imageinput');


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

rapid.call('SpotifyPublicAPI', 'searchPlaylists', { 
  'accessToken': 'BQASU2Sj3fbNBfBRTXeMf5e9STiDMyvoSV2pid1NgjEF4dKHUvXGx-1v-3wOTFJgyUlA3OyYaibrk_bbSoQw771Q_HJAxaO5Ga-vX27gF4cUjMtA_afDx-jfnc-pnJoT9Q_0DXbR8UKkf__qab9kAIHaxo68lUg',

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
	   (payload.playlists.items[0].external_urls.spotify);
  }).on('error', (payload) => {
	   console.log("Spotify Playlist Query Error");
  });
}).on('error', (payload) => {
  console.log("Microsoft Emotion Error");
});


