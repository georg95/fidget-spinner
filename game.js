console.log('hello world');
var sound0 = null;
var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
console.log('audio:', audioCtx);

(function() {
  var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                              window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
  window.requestAnimationFrame = requestAnimationFrame;
})();

function windowHeight()
  {
  var body = document.body,
      html = document.documentElement;
  return Math.max(body.scrollHeight, body.offsetHeight,
                  html.clientHeight, html.scrollHeight, html.offsetHeight);
  }
function windowWidth()
  {
  return document.body.clientWidth;
  }

function createCanvas()
  {
  var canvas = document.createElement('canvas');

  var canvasSize = Math.min(windowWidth(), windowHeight());
  console.log('canvas size:', canvasSize);
  canvas.width = canvasSize;
  canvas.height = canvasSize;
  return canvas;
  }

function drawSpinner(canvas, images)
  {
  var ctx = canvas.getContext('2d');
  var W = canvas.width;
  var H = canvas.height;
  var rotateDeg = 0;
  function redraw()
    {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, W, H);

    ctx.translate(W/2, H/2);
    ctx.drawImage(images['button'], 0, 0, 530, 530, -W/2, -H/2, W, H);
    ctx.rotate(rotateDeg*Math.PI/180);
    ctx.drawImage(images['spinner'], 0, 0, 530, 530, -W/2, -H/2, W, H);

    rotateDeg += 9;
    requestAnimationFrame(redraw);
    }
  requestAnimationFrame(redraw);
  }

function loadPic()
  {
  var canvas = createCanvas();
  document.body.appendChild(canvas);
  var spinnerImg = new Image();
  spinnerImg.src = 'spinner.png';
  spinnerImg.onload = function()
    {
    var spinnerButton = new Image();
    spinnerButton.src = 'button.png';
    spinnerButton.onload = function()
      {
      drawSpinner(canvas,
          {
          'spinner': spinnerImg,
          'button': spinnerButton
          });
      }
    }
  loadSounds();
  }
document.addEventListener('DOMContentLoaded', loadPic);

function playSound(buffer)
  {
  console.log('play sound');
  var source = audioCtx.createBufferSource();
  source.buffer = buffer;
  source.connect(audioCtx.destination);
  source.start(0);
  source.loop = true;
  }

function loadSounds() {
  console.log('loading sounds...');
  function onError(err)
    {
    console.log('error ocurred:', err)
    }
  var url = 'YouSpinMeRound0.ogg';
  var request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.responseType = 'arraybuffer';
  request.onload = function() {
    audioCtx.decodeAudioData(request.response, function(buffer) {
      sound0 = buffer;
      playSound(sound0);
    }, onError);
  }
  request.send();
}
