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
  var R = 130/530*W;
  var rotateDeg = 0, rotAngle = 0;
  var movespeeds = [];
  var moving = false;
  var speed = 20;
  var dragDeg = 0, dragAngle = 0;
  var prevTime = 0;
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
  canvas.onmousedown = function(e)
    {
    if(onDrag(e.offsetX, e.offsetY))
      {
      moving = true;
      speed = 0;
      movespeeds = [];
      dragDeg = rotateDeg;
      dragAngle = Math.atan2(e.offsetY-H/2,e.offsetX-W/2);
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
  canvas.onmouseup = leaveFingers;
  canvas.onmouseout = leaveFingers;

  canvas.onmousemove = function(e)
    {
    //console.log(e.which);
    if(!moving) { return false; }
    var mx = e.offsetX;
    var my = e.offsetY;
    var newAngle = Math.atan2(my-H/2,mx-W/2);
    var degDiff = (newAngle-dragAngle)/Math.PI*180;
    var timediff = Date.now()-prevTime;
    prevTime = Date.now();
    movespeeds.push(degDiff/timediff);
    if(movespeeds.length > 4)
      {movespeeds.shift();}
    rotateDeg = dragDeg+degDiff;
    }
  function redraw()
    {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.translate(W/2, H/2);
    ctx.drawImage(images['button'], 0, 0, 530, 530, -W/2, -H/2, W, H);
    ctx.rotate(rotAngle);
    ctx.drawImage(images['spinner'], 0, 0, 530, 530, -W/2, -H/2, W, H);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    rotateDeg += speed;
    if(speed > 0) { speed=Math.max(0, speed-0.03); }
    if(speed < 0) { speed=Math.min(0, speed+0.03); }
    rotAngle = rotateDeg*Math.PI/180;
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
