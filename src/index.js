function loadConfig() {
  if (localStorage.getItem('darkMode') == 1) {
    document.documentElement.dataset.theme = 'dark';
  }
}
loadConfig();

function toggleDarkMode() {
  if (localStorage.getItem('darkMode') == 1) {
    localStorage.setItem('darkMode', 0);
    delete document.documentElement.dataset.theme;
  } else {
    localStorage.setItem('darkMode', 1);
    document.documentElement.dataset.theme = 'dark';
  }
}

// +-*/のテストデータ生成範囲を返却
function getNumRange(grade) {
  switch(grade) {
    case 1: return [[ 9, 1],   [[10, 5] ,[ 5, 1]],  [9,1],  [[ 9, 1], [ 5, 1]]];
    case 2: return [[14, 2],   [[20,11], [10, 1]],  [9,1],  [[19, 1], [ 5, 1]]];
    case 3: return [[19, 4],   [[26,16], [15, 6]],  [9,1],  [[99,10], [ 9, 1]]];
    case 4: return [[24, 8],   [[99,50], [50,11]],  [9,1],  [[99,20], [19,11]]];
    default:return [[49,11],   [[99,50], [50,11]],  [9,1],  [[99,20], [19,11]]];
  }
}

let startTime;
let gameTimer;
function startGameTimer() {
  clearInterval(gameTimer);
  var timeNode = document.getElementById('time');
  startTime = Date.now();
  gameTimer = setInterval(function() {
    timeNode.innerText = (Date.now() - startTime) / 1000;
  }, 200);
}

let countdownTimer;
function countdown() {
  initTable();
  clearTimeout(countdownTimer);
  gameStart.classList.remove('d-none');
  playPanel.classList.add('d-none');
  scorePanel.classList.add('d-none');
  var counter = document.getElementById('counter');
  counter.innerText = 3;
  countdownTimer = setInterval(function(){
    var colors = ['skyblue', 'greenyellow', 'violet', 'tomato'];
    if (parseInt(counter.innerText) > 1) {
      var t = parseInt(counter.innerText) - 1;
      counter.style.backgroundColor = colors[t];
      counter.innerText = t;
    } else {
      clearTimeout(countdownTimer);
      gameStart.classList.add('d-none');
      playPanel.classList.remove('d-none');
      document.getElementById('score').innerText = 0;
      startGameTimer();
    }
  }, 1000);
}

function initMasu() {
  var min = document.getElementById('masu').offsetWidth;
  var headerHeight = document.getElementById('header').offsetHeight;
  var height = window.innerHeight - headerHeight - 10;
  if (height < min) {
    min = height;
  }
  document.getElementById('masu').style.fontSize = min / 11 * 0.6 + 'px';
}

function initCalc() {
  var scoreObj = document.getElementById('score');
  document.getElementById('be').onclick = function() {
    var replyObj = document.getElementById('table').querySelector('.table-danger');
    var reply = replyObj.innerText;
    var answer = replyObj.dataset.answer;
    if (answer == reply) {
      new Audio('mp3/correct3.mp3').play();
      replyObj.innerText = '';
      scoreObj.innerText = parseInt(scoreObj.innerText) + 1;
      moveCursorNext(replyObj);
      if (scoreObj.innerText == '100') {
        clearInterval(gameTimer);
        playPanel.classList.add('d-none');
        scorePanel.classList.remove('d-none');
        var t = document.getElementById('time').innerText;
        scoreObj.innerText = (Date.now() - startTime) / 1000;
      }
    } else {
      new Audio('mp3/incorrect1.mp3').play();
    }
  }
  document.getElementById('bc').onclick = function() {
    var replyObj = document.getElementById('table').querySelector('.table-danger');
    replyObj.innerText = '';
  }
  for (var i=0; i<10; i++) {
    document.getElementById('b' + i).onclick = function() {
      var replyObj = document.getElementById('table').querySelector('.table-danger');
      var reply = replyObj.innerText;
      reply += this.getAttribute('id').slice(-1);
      if (reply.length > 2) {
        reply = reply.slice(1, 3);
      }
      replyObj.innerText = reply;
      var answer = replyObj.dataset.answer;
      if (answer == reply) {
        new Audio('mp3/correct3.mp3').play();
        scoreObj.innerText = parseInt(scoreObj.innerText) + 1;
        moveCursorNext(replyObj);
        if (scoreObj.innerText == '100') {
          clearInterval(gameTimer);
          playPanel.classList.add('d-none');
          scorePanel.classList.remove('d-none');
          var t = document.getElementById('time').innerText;
          scoreObj.innerText = (Date.now() - startTime) / 1000;
        }
      }
    }
  }
}

function shuffle(array) {
  for (i = array.length; 1 < i; i--) {
    k = Math.floor(Math.random() * i);
    [array[k], array[i - 1]] = [array[i - 1], array[k]];
  }
  return array;
}

function initTable() {
  initTableHeader();
  initTableAnswers();
  [...document.getElementById('table').querySelectorAll('td.table-danger')].forEach(td => {
    td.className = '';
  })
  document.getElementById('table').getElementsByTagName('tr')[1].children[1].className = 'table-danger';
}

function initTableAnswers() {
  var course = document.getElementById('courseOption').selectedIndex;
  var trs = document.getElementById('table').getElementsByTagName('tr');
  var ths = trs[0].children;
  for (var i=1; i<trs.length; i++) {
    var tds = trs[i].children;
    for (var j=1; j<tds.length; j++) {
      var answer;
      var a = parseInt(ths[j].innerText);
      var b = parseInt(tds[0].innerText);
      if (course == 0) {
        answer = a + b;
      } else if (course == 1) {
        answer = a - b;
      } else if (course == 2) {
        answer = a * b;
      } else {
        answer = Math.floor(a / b);
      }
      tds[j].dataset.answer = answer;
      tds[j].innerText = '';
    }
  }
}

function initTableHeader() {
  var table = document.getElementById('table');
  var ths = table.getElementsByTagName('th');
  var grade = document.getElementById('gradeOption').selectedIndex + 1;
  var course = document.getElementById('courseOption').selectedIndex;
  if (course == 1 || course == 3) {
    var [to, from] = getNumRange(grade)[course][0];
    var range = Array.from(new Array(to-from+1)).map((v,i) => i+from);
    var arr = shuffle(range.slice());
    arr = arr.concat(shuffle(range.slice()));
    for (var i=1; i<=10; i++) {
      ths[i].innerText = arr[i];
    }
    var [to, from] = getNumRange(grade)[course][1];
    range = Array.from(new Array(to-from+1)).map((v,i) => i+from);
    arr = shuffle(range.slice());
    arr = arr.concat(shuffle(range.slice()));
    for (var i=11; i<=20; i++) {
      ths[i].innerText = arr[i-11];
    }
  } else {
    var [to, from] = getNumRange(grade)[course];
    var range = Array.from(new Array(to-from+1)).map((v,i) => i+from);
    var arr = shuffle(range);
    arr = arr.concat(shuffle(range.slice())).concat(shuffle(range.slice()));
    for (var i=1; i<=20; i++) {
      ths[i].innerText = arr[i];
    }
  }
}

function moveCursorNext(obj) {
  var objY = obj.parentNode;
  var trs = [...document.getElementById('table').getElementsByTagName('tr')];
  var tds = [...obj.parentNode.children];
  var x = tds.indexOf(obj);
  var y = trs.indexOf(objY);
  var newObj;
  if (y == 10) {
    if (x == 10) {
      newObj = obj;
    } else {
      newObj = trs[1].children[x+1];
    }
  } else {
    newObj = trs[y+1].children[x];
  }
  obj.className = '';
  newObj.className = 'table-danger';
}

function moveCursor(obj) {
  var prevObj = document.getElementById('table').querySelector('td.table-danger');
  prevObj.className = '';
  obj.className = 'table-danger';
}


[...document.getElementsByTagName('td')].forEach(td => {
  td.onmousedown = function() {
    moveCursor(this);
  }
  td.ontouchstart = function() {
    moveCursor(this);
  }
});
document.getElementById('courseOption').onchange = function() {
  var text = this.options[this.selectedIndex].innerText;
  document.getElementById('courseText').innerHTML = text;
  initTable();
}
document.getElementById('gradeOption').onchange = function() {
  initTable();
}
initTable();
initMasu();
window.onresize = function() {
  initMasu();
};
initCalc();

