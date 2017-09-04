var context = new AudioContext();
var buffer;
var source;
var isPlaying = false;

fetch("https://s3-us-west-2.amazonaws.com/s.cdpn.io/254249/break.ogg")
  .then(response => response.arrayBuffer())
  .then(arrayBuffer => context.decodeAudioData(arrayBuffer))
  .then(audioBuffer => {
    buffer = audioBuffer;
  });

function start() {
  source = context.createBufferSource();
  source.buffer = buffer;
  source.connect(context.destination);
  source.loop = true;
  source.start();
}

function stop() {
  source.stop();
}

function toogle(button) {
  isPlaying = !isPlaying;
  if(isPlaying) {
    start();
    button.innerHTML = "Stop";
  } else {
    stop();
    button.innerHTML = "Start";
  }
}