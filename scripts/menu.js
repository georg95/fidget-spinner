
function extractHash(url)
  {
  return url.slice(url.lastIndexOf('#'));
  }

function recalcStyles()
  {
  var bought = JSON.parse(localStorage.getItem('spinners') || '{}');
  var spinners = document.getElementsByClassName('option');

  console.log('bought:', bought);
  function buy(i, price)
    { return function() { buySpinner(i, price); recalcStyles(); } }
  function switchTo(i)
    { return function() { changeSpinner(i); recalcStyles(); } }
  for(var i = 0; i < spinners.length; i++)
    {
    spinners[i].style = '';
    var priceNode = spinners[i].children[2];
    if(bought[i])
      {
      console.log('spinner',i,'bought');
      priceNode.style.visibility = 'hidden';
      spinners[i].onclick = switchTo(i);
      continue;
      }
    var price = parseInt(priceNode.innerText);
    console.log('price:', price);
    if(price > spincounter)
      {
      priceNode.style.background = '#888';
      spinners[i].onclick = '';
      }
    else
      {
      priceNode.style.background = '#8F8';
      spinners[i].onclick = buy(i, price);
      }
    }
  var cur_spinner_ind = spinnerStats.indexOf(cur_spinner);
  console.log('spinners[cur_spinner_ind]:', spinners[cur_spinner_ind]);
  console.assert(cur_spinner_ind >= 0);
  spinners[cur_spinner_ind].style = 'background: rgba(100,255,150,0.5)';
  }

function showMenu()
  {
  document.getElementById('menu').style.display = 'block';
  document.getElementById('menuSwitch').href = '#';
  recalcStyles();
  }

function hideMenu()
  {
  document.getElementById('menu').style.display = 'none';
  document.getElementById('menuSwitch').href = '#menu';
  }

window.onhashchange = function(e) {
 var newState = extractHash(e.newURL);
 console.log('hash changed', newState);
 if(newState === '#menu')
  { showMenu(); }
 if(newState === '/' || newState === '#')
  { hideMenu(); }
}
