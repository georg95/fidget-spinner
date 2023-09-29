
var use_vibro = true;

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
  function onDrag(x,y)
    {
    for(var i = 0; i < 3; i++)
      {
      var cx = W/2+R*Math.cos(rotAngle-Math.PI/2+i*Math.PI*2/3);
      var cy = H/2+R*Math.sin(rotAngle-Math.PI/2+i*Math.PI*2/3);
      if(dst(x,y,cx,cy) < R/2) { return true; }
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
      { switchSound(); }
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
    if("vibrate" in navigator)
      {
      var vibro_img = use_vibro ? 'vibro_on' : 'vibro_off';
      ctx.drawImage(images[vibro_img], 0, 0, 256, 256, W*6/7, 0, W/7, H/7);
      }
    ctx.translate(W/2, H/2);
    ctx.drawImage(images['button'], 0, 0, 530, 530, -W/2, -H/2, W, H);
    ctx.rotate(rotAngle);
    ctx.drawImage(images['spinner'], 0, 0, 530, 530, -W/2, -H/2, W, H);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle='#999';
    ctx.strokeStyle = "#999";
    ctx.translate(W/2, 15);
    ctx.fillText(""+spincounter, -(""+spincounter).length*30/2, 30/2);
    rotateDeg += speed;
    if(speed > 0) { speed=Math.max(0, speed-0.05);
      if(rotateDeg > 360) { while(rotateDeg > 360) { rotateDeg-=360; spincounter++; } vib(); } }
    if(speed < 0) { speed=Math.min(0, speed+0.05)
      if(rotateDeg < -360) { while(rotateDeg < -360) { rotateDeg+=360; spincounter++; } vib(); } }
    rotAngle = rotateDeg*Math.PI/180;
    function vib() { if(use_vibro && "vibrate" in navigator) navigator.vibrate(6); }
    requestAnimationFrame(redraw);
    }
  requestAnimationFrame(redraw);
  }

function countDown(len, callback)
  {
  return function()
    { if(--len === 0) { callback(); } }
  }

function loadPics(base, pics, callback)
  {
  var countDownCallback = countDown(pics.length, function() { callback(imgbase); });
  var imgbase = {};
  pics.forEach(function(name)
    {
    var img = new Image();
    img.src = base+name;
    function addNewImage()
      {
      imgbase[name.slice(0, name.lastIndexOf('.'))] = img;
      countDownCallback();
      }
    img.onload = addNewImage;
    img.onerror = function()
      {
      console.log('error while loading', base+name);
      addNewImage(); // btw we don't want break all
      }
    })
  }

function loadGame()
  {
  var canvas = createCanvas();
  document.body.appendChild(canvas);
  loadPics('pics/',
    ['spinner.png',
     'button.png',
     'speaker_on.png',
     'speaker_off.png',
     'vibro_on.png',
     'vibro_off.png'], function(pics)
      {
      drawSpinner(canvas, pics);
      });
  }
document.addEventListener('DOMContentLoaded', loadGame);
