const infoPanel = document.getElementById("infoPanel");
const scorePanel = document.getElementById("scorePanel");
let endAudio, incorrectAudio, correctAudio;
loadAudios();
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();
loadConfig();

function loadConfig() {
  if (localStorage.getItem("darkMode") == 1) {
    document.documentElement.dataset.theme = "dark";
  }
}

function toggleDarkMode() {
  if (localStorage.getItem("darkMode") == 1) {
    localStorage.setItem("darkMode", 0);
    delete document.documentElement.dataset.theme;
  } else {
    localStorage.setItem("darkMode", 1);
    document.documentElement.dataset.theme = "dark";
  }
}

function playAudio(audioBuffer, volume) {
  const audioSource = audioContext.createBufferSource();
  audioSource.buffer = audioBuffer;
  if (volume) {
    const gainNode = audioContext.createGain();
    gainNode.gain.value = volume;
    gainNode.connect(audioContext.destination);
    audioSource.connect(gainNode);
    audioSource.start();
  } else {
    audioSource.connect(audioContext.destination);
    audioSource.start();
  }
}

function unlockAudio() {
  audioContext.resume();
}

function loadAudio(url) {
  return fetch(url)
    .then((response) => response.arrayBuffer())
    .then((arrayBuffer) => {
      return new Promise((resolve, reject) => {
        audioContext.decodeAudioData(arrayBuffer, (audioBuffer) => {
          resolve(audioBuffer);
        }, (err) => {
          reject(err);
        });
      });
    });
}

function loadAudios() {
  promises = [
    loadAudio("mp3/end.mp3"),
    loadAudio("mp3/incorrect1.mp3"),
    loadAudio("mp3/correct3.mp3"),
  ];
  Promise.all(promises).then((audioBuffers) => {
    endAudio = audioBuffers[0];
    incorrectAudio = audioBuffers[1];
    correctAudio = audioBuffers[2];
  });
}

// +-*/のテストデータ生成範囲を返却
function getNumRange(grade) {
  switch (grade) {
    case 1:
      return [[9, 1], [[10, 5], [5, 1]], [9, 1], [[9, 1], [5, 1]]];
    case 2:
      return [[14, 2], [[20, 11], [10, 1]], [9, 1], [[19, 1], [5, 1]]];
    case 3:
      return [[19, 4], [[26, 16], [15, 6]], [9, 1], [[99, 10], [9, 1]]];
    case 4:
      return [[24, 8], [[99, 50], [50, 11]], [9, 1], [[99, 20], [19, 11]]];
    default:
      return [[49, 11], [[99, 50], [50, 11]], [9, 1], [[99, 20], [19, 11]]];
  }
}

let startTime;
let gameTimer;
function startGameTimer() {
  clearInterval(gameTimer);
  const timeNode = document.getElementById("time");
  startTime = Date.now();
  gameTimer = setInterval(function () {
    timeNode.textContent = (Date.now() - startTime) / 1000;
  }, 200);
}

let countdownTimer;
function countdown() {
  initTable();
  clearTimeout(countdownTimer);
  gameStart.classList.remove("d-none");
  infoPanel.classList.add("d-none");
  scorePanel.classList.add("d-none");
  const counter = document.getElementById("counter");
  counter.textContent = 3;
  countdownTimer = setInterval(function () {
    const colors = ["skyblue", "greenyellow", "violet", "tomato"];
    if (parseInt(counter.textContent) > 1) {
      const t = parseInt(counter.textContent) - 1;
      counter.style.backgroundColor = colors[t];
      counter.textContent = t;
    } else {
      clearTimeout(countdownTimer);
      gameStart.classList.add("d-none");
      infoPanel.classList.remove("d-none");
      document.getElementById("score").textContent = 0;
      startGameTimer();
    }
  }, 1000);
}

function initMasu() {
  let min = document.getElementById("masu").offsetWidth;
  const headerHeight = document.getElementById("header").offsetHeight;
  const height = window.innerHeight - headerHeight - 10;
  if (height < min) {
    min = height;
  }
  document.getElementById("masu").style.fontSize = min / 11 * 0.6 + "px";
}

function initCalc() {
  const scoreObj = document.getElementById("score");
  document.getElementById("be").onclick = function () {
    const replyObj = document.getElementById("table").querySelector(
      ".table-danger",
    );
    const reply = replyObj.textContent;
    const answer = replyObj.dataset.answer;
    if (answer == reply) {
      playAudio(correctAudio);
      replyObj.textContent = "";
      scoreObj.textContent = parseInt(scoreObj.textContent) + 1;
      moveCursorNext(replyObj);
      if (scoreObj.textContent == "100") {
        clearInterval(gameTimer);
        infoPanel.classList.add("d-none");
        scorePanel.classList.remove("d-none");
        scoreObj.textContent = (Date.now() - startTime) / 1000;
      }
    } else {
      playAudio(incorrectAudio);
    }
  };
  document.getElementById("bc").onclick = function () {
    const replyObj = document.getElementById("table").querySelector(
      ".table-danger",
    );
    replyObj.textContent = "";
  };
  for (let i = 0; i < 10; i++) {
    document.getElementById("b" + i).onclick = function () {
      const replyObj = document.getElementById("table").querySelector(
        ".table-danger",
      );
      let reply = replyObj.textContent;
      reply += this.getAttribute("id").slice(-1);
      if (reply.length > 2) {
        reply = reply.slice(1, 3);
      }
      replyObj.textContent = reply;
      const answer = replyObj.dataset.answer;
      if (answer == reply) {
        playAudio(correctAudio);
        scoreObj.textContent = parseInt(scoreObj.textContent) + 1;
        moveCursorNext(replyObj);
        if (scoreObj.textContent == "100") {
          playAudio(endAudio);
          clearInterval(gameTimer);
          infoPanel.classList.add("d-none");
          scorePanel.classList.remove("d-none");
          scoreObj.textContent = (Date.now() - startTime) / 1000;
        }
      }
    };
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
  [...document.getElementById("table").querySelectorAll("td.table-danger")]
    .forEach((td) => {
      td.className = "";
    });
  document.getElementById("table").getElementsByTagName("tr")[1].children[1]
    .className = "table-danger";
}

function initTableAnswers() {
  const course = document.getElementById("courseOption").selectedIndex;
  const trs = document.getElementById("table").getElementsByTagName("tr");
  const ths = trs[0].children;
  for (let i = 1; i < trs.length; i++) {
    const tds = trs[i].children;
    for (let j = 1; j < tds.length; j++) {
      let answer;
      const a = parseInt(ths[j].textContent);
      const b = parseInt(tds[0].textContent);
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
      tds[j].textContent = "";
    }
  }
}

function initTableHeader() {
  const table = document.getElementById("table");
  const ths = table.getElementsByTagName("th");
  const grade = document.getElementById("gradeOption").selectedIndex + 1;
  const course = document.getElementById("courseOption").selectedIndex;
  if (course == 1 || course == 3) {
    let [to, from] = getNumRange(grade)[course][0];
    let range = Array.from(new Array(to - from + 1)).map((_v, i) => i + from);
    let arr = shuffle(range.slice());
    arr = arr.concat(shuffle(range.slice()));
    for (let i = 1; i <= 10; i++) {
      ths[i].textContent = arr[i];
    }
    [to, from] = getNumRange(grade)[course][1];
    range = Array.from(new Array(to - from + 1)).map((_v, i) => i + from);
    arr = shuffle(range.slice());
    arr = arr.concat(shuffle(range.slice()));
    for (let i = 11; i <= 20; i++) {
      ths[i].textContent = arr[i - 11];
    }
  } else {
    const [to, from] = getNumRange(grade)[course];
    const range = Array.from(new Array(to - from + 1)).map((_v, i) => i + from);
    let arr = shuffle(range);
    arr = arr.concat(shuffle(range.slice())).concat(shuffle(range.slice()));
    for (let i = 1; i <= 20; i++) {
      ths[i].textContent = arr[i];
    }
  }
}

function moveCursorNext(obj) {
  const objY = obj.parentNode;
  const trs = [...document.getElementById("table").getElementsByTagName("tr")];
  const tds = [...obj.parentNode.children];
  const x = tds.indexOf(obj);
  const y = trs.indexOf(objY);
  let newObj;
  if (y == 10) {
    if (x == 10) {
      newObj = obj;
    } else {
      newObj = trs[1].children[x + 1];
    }
  } else {
    newObj = trs[y + 1].children[x];
  }
  obj.className = "";
  newObj.className = "table-danger";
}

function moveCursor(obj) {
  const prevObj = document.getElementById("table").querySelector(
    "td.table-danger",
  );
  prevObj.className = "";
  obj.className = "table-danger";
}

initTable();
initMasu();
initCalc();

document.getElementById("toggleDarkMode").onclick = toggleDarkMode;
document.getElementById("startButton").onclick = countdown;
document.getElementById("restartButton").onclick = countdown;
[...document.getElementsByTagName("td")].forEach((td) => {
  td.onmousedown = function () {
    moveCursor(this);
  };
  td.ontouchstart = function () {
    moveCursor(this);
  };
});
document.getElementById("gradeOption").onchange = initTable;
window.onresize = initMasu;
document.getElementById("courseOption").onchange = function () {
  const text = this.options[this.selectedIndex].textContent;
  document.getElementById("courseText").innerHTML = text;
  initTable();
};
document.addEventListener("click", unlockAudio, {
  once: true,
  useCapture: true,
});
