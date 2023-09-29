var use_sound = JSON.parse(localStorage.getItem('use_sound') || true);

document.addEventListener('DOMContentLoaded', initSound);

var switchSound = function() {};

function initSound()
  {
  var safari_sound_enabled = false;
  var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  console.log('audio:', audioCtx);
  var gainNode = audioCtx.createGain();
  var source;
  var sounds = [];
  switchSound = function()
    {
    use_sound = !use_sound
    if(use_sound) { gainNode.gain.value = 1; }
    else          { gainNode.gain.value = 0; }
    localStorage.setItem('use_sound', use_sound);
    }

  function enableSoundOnSafari()
    {
    if(safari_sound_enabled) { return; }
    var buffer = audioCtx.createBuffer(1, 1, 22050);
  	var source = audioCtx.createBufferSource();
  	source.buffer = buffer;
  	source.connect(audioCtx.destination);
  	if(source.noteOn) { source.noteOn(0); }
    safari_sound_enabled = true;
    }

  function enableSound()
    {
    enableSoundOnSafari();
    playSound(sounds[0]);
    }
  window.addEventListener('touchstart', enableSound, false);
  window.addEventListener('mousedown', enableSound, false);

  function playSound(buffer)
    {
    if(source || !buffer) { return; }
    console.log('play sound');
    source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    source.loop = true;
    source.start(0);
    }

  function loadSounds()
    {
    console.log('loading sounds...');
    loadSound('YouSpinMeRound1.ogg', function(sound1)
      {
      sounds = [sound1];
      });
    }

  function loadSound(name, callback)
    {
    function onError(err)
      {
      console.log('error ocurred:', err)
      }
    var request = new XMLHttpRequest();
    request.open('GET', name, true);
    request.responseType = 'arraybuffer';
    request.onload = function() {
      audioCtx.decodeAudioData(request.response, function(buffer) {
        callback(buffer);
        }, onError);
      }
    request.send();
    }
  loadSounds();
  }
