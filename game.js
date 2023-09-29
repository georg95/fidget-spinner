console.log('hello world');
var use_sound = true;
var use_vibro = true;

var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
console.log('audio:', audioCtx);
var gainNode = audioCtx.createGain();

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
  var R = 130/530*W;
  var rotateDeg = 0, rotAngle = 0;
  var movespeeds = [];
  var moving = false;
  var speed = 20;
  var dragDeg = 0, dragAngle = 0, prevAngle = 0;
  var prevTime = 0;
  var spincounter = 0;

  ctx.font = "30pt Arial";
  function dst(x,y,x2,y2)
    { return Math.sqrt((x-x2)*(x-x2)+(y-y2)*(y-y2)); }
  function cos2(x,y,x2,y2)
    { return (x*x2+y*y2)/dst(0,0,x,y)/dst(0,0,x2,y2); }
  function spd(x,y,x2,y2)
    {
    var a = Math.atan2(y2-y, x2-x);
    var b = Math.atan2(y-H/2, x-H/2)+Math.PI/2;
    console.log('angle1:', a/Math.PI*180);
    console.log('angle2:', b/Math.PI*180);
    return dst(x,y,x2,y2)*Math.cos(b-a);
    }
  function onDrag(x,y)
    {
    console.log('drag at', x, y);
    for(var i = 0; i < 3; i++)
      {
      var cx = W/2+R*Math.cos(rotAngle-Math.PI/2+i*Math.PI*2/3);
      var cy = H/2+R*Math.sin(rotAngle-Math.PI/2+i*Math.PI*2/3);
      if(dst(x,y,cx,cy) < R/2) { console.log('drag successful'); return true; }
      }
    return false;
    }
  function checkVibro(x,y)
    {
    if (x > W*6/7 && x < W && y > 0 && y < H/7)
      { use_vibro = !use_vibro; }
    }
  function checkAudio(x,y)
    {
    if (x > 0 && x < W/7 && y > 0 && y < H/7)
      {
      use_sound = !use_sound
      if(use_sound) { gainNode.gain.value = 1; }
      else          { gainNode.gain.value = 0; }
      }
    }
  function takeSpinner(e)
    {
    e.preventDefault();
    //console.log(e);
    var ex = eventX(e);
    var ey = eventY(e)
    checkAudio(ex, ey);
    checkVibro(ex, ey);
    if(onDrag(ex, ey))
      {
      moving = true;
      speed = 0;
      movespeeds = [];
      dragDeg = rotateDeg;
      dragAngle = Math.atan2(ey-H/2,ex-W/2);
      prevAngle = dragAngle;
      prevTime = Date.now();
      }
    }

  function leaveFingers(e)
    {
    if(!moving) { return; }
    moving = false;
    if(movespeeds.length !== 0)
       { speed = movespeeds.reduce(function(a,b)
          { return Math.abs(a)>Math.abs(b)?a:b; }, 0); }
    console.log('speeds:', movespeeds);
    console.log('speed:', speed);
    }
  function flipSpinner(e)
    {
    e.preventDefault();
    //console.log(e.which);
    if(!moving) { return false; }
    var newAngle = Math.atan2(eventY(e)-H/2,eventX(e)-W/2);
    var degDiff = (newAngle-dragAngle)/Math.PI*180;
    var timediff = Date.now()-prevTime;
    prevTime = Date.now();
    movespeeds.push((newAngle-prevAngle)/Math.PI*180/timediff*20);
    prevAngle = newAngle;
    if(movespeeds.length > 3)
      {movespeeds.shift();}
    rotateDeg = dragDeg+degDiff;
    }

  canvas.onmousedown = takeSpinner;
  canvas.onmousemove = flipSpinner;
  canvas.onmouseup = leaveFingers;
  canvas.onmouseout = leaveFingers;
  canvas.addEventListener("touchstart", takeSpinner, false);
  canvas.addEventListener("touchend", leaveFingers, false);
  canvas.addEventListener("touchcancel", leaveFingers, false);
  canvas.addEventListener("touchmove", flipSpinner, false);

  function eventX(e)
    {
    e = e || window.event;
    var x = e.clientX;
    if(e.touches && e.touches[0])
      { x = e.touches[0].pageX; }
    return x;
    }
  function eventY(e)
    {
    e = e || window.event;
    var y = e.clientY;
    if(e.touches && e.touches[0])
      { y = e.touches[0].pageY; }
    return y;
    }


  var scale = 1;
  function redraw()
    {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, W, H);
    var speaker_img = use_sound ? 'speaker_on' : 'speaker_off';
    ctx.drawImage(images[speaker_img], 0, 0, 256, 256, 0, 0, W/7, H/7);
    var vibro_img = use_vibro ? 'vibro_on' : 'vibro_off';
    ctx.drawImage(images[vibro_img], 0, 0, 256, 256, W*6/7, 0, W/7, H/7);
    ctx.translate(W/2, H/2);
    ctx.drawImage(images['button'], 0, 0, 530, 530, -W/2, -H/2, W, H);
    ctx.rotate(rotAngle);
    ctx.drawImage(images['spinner'], 0, 0, 530, 530, -W/2, -H/2, W, H);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    // ctx.fillStyle='#0F0';
    // ctx.fillRect(0,0,spincounter,10);
    ctx.fillStyle='#999';
    ctx.strokeStyle = "#999";
    ctx.translate(W/2, 15);
    ctx.fillText(""+spincounter, -(""+spincounter).length*30/2, 30/2);
    rotateDeg += speed;
    if(speed > 0) { speed=Math.max(0, speed-0.03);
      if(rotateDeg > 360) { rotateDeg-=360; spincounter++; vib(); } }
    if(speed < 0) { speed=Math.min(0, speed+0.03)
      if(rotateDeg < -360) { rotateDeg+=360; spincounter++; vib(); } }
    rotAngle = rotateDeg*Math.PI/180;
    function vib() { if(use_vibro && "vibrate" in navigator) navigator.vibrate(6); }
    // if(cur_sound === 0 && spincounter > 250)
    //   {
    //   source.loop = false;
    //   source.onended = function()
    //       {
    //       playSound(sounds[++cur_sound]);
    //       }
    //   }
    // TODO sound switch
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
      var soundOn = new Image();
      soundOn.src = 'speaker_on.png';
      soundOn.onload = function()
        {
        var soundOff = new Image();
        soundOff.src = 'speaker_off.png';
        soundOff.onload = function()
          {
          var vibroOn = new Image();
          vibroOn.src = 'vibro_on.png';
          vibroOn.onload = function()
            {
            var vibroOff = new Image();
            vibroOff.src = 'vibro_off.png';
            vibroOff.onload = function()
              {
              drawSpinner(canvas,
                  {
                  'spinner': spinnerImg,
                  'button': spinnerButton,
                  'speaker_on': soundOn,
                  'speaker_off': soundOff,
                  'vibro_on': vibroOn,
                  'vibro_off': vibroOff
                  });
              }
            }
          }
        }
      }
    }
  loadSounds();
  }
document.addEventListener('DOMContentLoaded', loadPic);
var source;
var sounds = [];
var cur_sound = 0;
function playSound(buffer)
  {
  console.log('play sound');
  source = audioCtx.createBufferSource();
  source.buffer = buffer;
  source.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  source.start(0);
  source.loop = true;
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

function loadSounds()
  {
  console.log('loading sounds...');
  loadSound('YouSpinMeRound0.ogg', function(sound0)
    {
    loadSound('YouSpinMeRound1.ogg', function(sound1)
      {
      sounds = [sound0, sound1];
      playSound(sound1);
      });
    });
  }
