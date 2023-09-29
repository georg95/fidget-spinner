
function extractHash(url)
  {
  return url.slice(url.lastIndexOf('#'));
  }

function showMenu()
  {
  document.getElementById('menu').style.display = 'block';
  document.getElementById('menuSwitch').href = '#';
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
