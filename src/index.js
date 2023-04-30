const countPanel = document.getElementById("countPanel");
const infoPanel = document.getElementById("infoPanel");
const scorePanel = document.getElementById("scorePanel");
const audioContext = new AudioContext();
const audioBufferCache = {};
loadAudio("end", "mp3/end.mp3");
loadAudio("correct", "mp3/correct3.mp3");
let japaneseVoices = [];
loadVoices();
let correctCount = 0;
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

function loadVoices() {
  // https://stackoverflow.com/questions/21513706/
  const allVoicesObtained = new Promise(function (resolve) {
    let voices = speechSynthesis.getVoices();
    if (voices.length !== 0) {
      resolve(voices);
    } else {
      let supported = false;
      speechSynthesis.addEventListener("voiceschanged", () => {
        supported = true;
        voices = speechSynthesis.getVoices();
        resolve(voices);
      });
      setTimeout(() => {
        if (!supported) {
          document.getElementById("noTTS").classList.remove("d-none");
        }
      }, 1000);
    }
  });
  allVoicesObtained.then((voices) => {
    japaneseVoices = voices.filter((voice) => voice.lang == "ja-JP");
  });
}

function speak(text) {
  speechSynthesis.cancel();
  const msg = new SpeechSynthesisUtterance(text);
  msg.voice = japaneseVoices[Math.floor(Math.random() * japaneseVoices.length)];
  msg.lang = "ja-JP";
  speechSynthesis.speak(msg);
}

async function playAudio(name, volume) {
  const audioBuffer = await loadAudio(name, audioBufferCache[name]);
  const sourceNode = audioContext.createBufferSource();
  sourceNode.buffer = audioBuffer;
  if (volume) {
    const gainNode = audioContext.createGain();
    gainNode.gain.value = volume;
    gainNode.connect(audioContext.destination);
    sourceNode.connect(gainNode);
    sourceNode.start();
  } else {
    sourceNode.connect(audioContext.destination);
    sourceNode.start();
  }
}

async function loadAudio(name, url) {
  if (audioBufferCache[name]) return audioBufferCache[name];
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  audioBufferCache[name] = audioBuffer;
  return audioBuffer;
}

function unlockAudio() {
  audioContext.resume();
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
  correctCount = 0;
  clearInterval(gameTimer);
  const timeNode = document.getElementById("time");
  startTime = Date.now();
  gameTimer = setInterval(() => {
    timeNode.textContent = (Date.now() - startTime) / 1000;
  }, 200);
}

let countdownTimer;
function countdown() {
  initTable();
  clearTimeout(countdownTimer);
  countPanel.classList.remove("d-none");
  infoPanel.classList.add("d-none");
  scorePanel.classList.add("d-none");
  const counter = document.getElementById("counter");
  counter.textContent = 3;
  countdownTimer = setInterval(() => {
    const colors = ["skyblue", "greenyellow", "violet", "tomato"];
    if (parseInt(counter.textContent) > 1) {
      const t = parseInt(counter.textContent) - 1;
      counter.style.backgroundColor = colors[t];
      counter.textContent = t;
    } else {
      clearTimeout(countdownTimer);
      countPanel.classList.add("d-none");
      infoPanel.classList.remove("d-none");
      startGameTimer();
    }
  }, 1000);
}

function initTableFontSize() {
  const table = document.getElementById("table");
  const width = table.offsetWidth;
  table.style.fontSize = width / 11 * 0.6 + "px";
}

function initCalc() {
  document.getElementById("be").onclick = () => {
    const replyObj = document.getElementById("table")
      .querySelector(".table-danger");
    const answer = replyObj.dataset.answer;
    speak(answer);
  };
  document.getElementById("bc").onclick = () => {
    const replyObj = document.getElementById("table")
      .querySelector(".table-danger");
    replyObj.textContent = "";
  };
  for (let i = 0; i < 10; i++) {
    document.getElementById("b" + i).onclick = (event) => {
      const replyObj = document.getElementById("table")
        .querySelector(".table-danger");
      let reply = replyObj.textContent;
      reply += event.target.getAttribute("id").slice(-1);
      if (reply.length > 2) {
        reply = reply.slice(1, 3);
      }
      replyObj.textContent = reply;
      const answer = replyObj.dataset.answer;
      if (answer == reply) {
        playAudio("correct");
        correctCount += 1;
        moveCursorNext(replyObj);
        if (correctCount == 100) {
          playAudio("end");
          clearInterval(gameTimer);
          infoPanel.classList.add("d-none");
          scorePanel.classList.remove("d-none");
          const time = (Date.now() - startTime) / 1000;
          document.getElementById("score").textContent = time;
        }
      }
    };
  }
}

function shuffle(array) {
  for (let i = array.length; 1 < i; i--) {
    const k = Math.floor(Math.random() * i);
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

initTable();
initTableFontSize();
initCalc();

document.getElementById("toggleDarkMode").onclick = toggleDarkMode;
document.getElementById("startButton").onclick = countdown;
document.getElementById("restartButton").onclick = countdown;
document.getElementById("gradeOption").onchange = initTable;
window.onresize = initTableFontSize;
document.getElementById("courseOption").onchange = (event) => {
  const obj = event.target;
  const text = obj.options[obj.selectedIndex].textContent;
  document.getElementById("courseText").innerHTML = text;
  initTable();
};
document.addEventListener("click", unlockAudio, {
  once: true,
  useCapture: true,
});
