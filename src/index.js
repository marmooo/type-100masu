const countPanel = document.getElementById("countPanel");
const infoPanel = document.getElementById("infoPanel");
const scorePanel = document.getElementById("scorePanel");
let correctCount = 0;
let audioContext;
const audioBufferCache = {};
let japaneseVoices = [];
loadVoices();
loadConfig();

function loadConfig() {
  if (localStorage.getItem("darkMode") == 1) {
    document.documentElement.setAttribute("data-bs-theme", "dark");
  }
}

function toggleDarkMode() {
  if (localStorage.getItem("darkMode") == 1) {
    localStorage.setItem("darkMode", 0);
    document.documentElement.setAttribute("data-bs-theme", "light");
  } else {
    localStorage.setItem("darkMode", 1);
    document.documentElement.setAttribute("data-bs-theme", "dark");
  }
}

function loadVoices() {
  // https://stackoverflow.com/questions/21513706/
  const allVoicesObtained = new Promise((resolve) => {
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
  const msg = new globalThis.SpeechSynthesisUtterance(text);
  msg.voice = japaneseVoices[Math.floor(Math.random() * japaneseVoices.length)];
  msg.lang = "ja-JP";
  speechSynthesis.speak(msg);
}

function createAudioContext() {
  if (globalThis.AudioContext) {
    return new globalThis.AudioContext();
  } else {
    console.error("Web Audio API is not supported in this browser");
    return null;
  }
}

function unlockAudio() {
  if (audioContext) {
    audioContext.resume();
  } else {
    audioContext = createAudioContext();
    loadAudio("end", "mp3/end.mp3");
    loadAudio("correct", "mp3/correct3.mp3");
  }
  document.removeEventListener("pointerdown", unlockAudio);
  document.removeEventListener("keydown", unlockAudio);
}

async function loadAudio(name, url) {
  if (!audioContext) return;
  if (audioBufferCache[name]) return audioBufferCache[name];
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    audioBufferCache[name] = audioBuffer;
    return audioBuffer;
  } catch (error) {
    console.error(`Loading audio ${name} error:`, error);
    throw error;
  }
}

function playAudio(name, volume) {
  if (!audioContext) return;
  const audioBuffer = audioBufferCache[name];
  if (!audioBuffer) {
    console.error(`Audio ${name} is not found in cache`);
    return;
  }
  const sourceNode = audioContext.createBufferSource();
  sourceNode.buffer = audioBuffer;
  const gainNode = audioContext.createGain();
  if (volume) gainNode.gain.value = volume;
  gainNode.connect(audioContext.destination);
  sourceNode.connect(gainNode);
  sourceNode.start();
}

// +-*/のテストデータ生成範囲を返却
function getNumRange(grade) {
  switch (grade) {
    case 1:
    case 6:
      return [[9, 1], [[10, 5], [5, 1]], [9, 0], [[9, 1], [5, 1]]];
    case 2:
      return [[14, 2], [[20, 11], [10, 1]], [9, 0], [[19, 1], [5, 1]]];
    case 3:
      return [[19, 4], [[26, 16], [15, 6]], [9, 0], [[99, 10], [9, 1]]];
    case 4:
      return [[24, 8], [[99, 50], [50, 11]], [9, 0], [[99, 20], [19, 11]]];
    case 5:
      return [[49, 11], [[99, 50], [50, 11]], [9, 0], [[99, 20], [19, 11]]];
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
  clearInterval(countdownTimer);
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
      clearInterval(countdownTimer);
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

function limitReplyText(reply) {
  const grade = document.getElementById("gradeOption").selectedIndex + 1;
  if (grade >= 6) {
    if (reply.startsWith("-")) {
      if (reply.length > 3) {
        return "-" + reply.slice(2, 4);
      }
    } else if (reply.length > 2) {
      return reply.slice(1, 3);
    }
  } else {
    if (reply.length > 2) {
      return reply.slice(1, 3);
    }
  }
  return reply;
}

function checkAnswer(answer, reply, cursor) {
  if (answer == reply) {
    playAudio("correct", 0.3);
    correctCount += 1;
    document.getElementById("bs").textContent = "−";
    moveCursorNext(cursor);
    if (correctCount == 100) {
      playAudio("end");
      clearInterval(gameTimer);
      infoPanel.classList.add("d-none");
      scorePanel.classList.remove("d-none");
      const time = (Date.now() - startTime) / 1000;
      document.getElementById("score").textContent = time;
    }
  }
}

function initCalc() {
  document.getElementById("be").onclick = () => {
    const cursor = document.getElementById("table")
      .querySelector(".table-danger");
    const answer = cursor.dataset.answer;
    speak(answer);
  };
  document.getElementById("bc").onclick = () => {
    const cursor = document.getElementById("table")
      .querySelector(".table-danger");
    cursor.textContent = "";
    document.getElementById("bs").textContent = "−";
  };
  document.getElementById("bs").onclick = (event) => {
    const cursor = document.getElementById("table")
      .querySelector(".table-danger");
    let reply = cursor.textContent;
    if (cursor.textContent.startsWith("-")) {
      event.target.textContent = "−";
      reply = cursor.textContent.slice(1);
    } else {
      event.target.textContent = "＋";
      reply = "-" + cursor.textContent.slice(0, 2);
    }
    reply = limitReplyText(reply);
    cursor.textContent = reply;
    const answer = cursor.dataset.answer;
    checkAnswer(answer, reply, cursor);
  };
  for (let i = 0; i < 10; i++) {
    document.getElementById("b" + i).onclick = (event) => {
      const cursor = document.getElementById("table")
        .querySelector(".table-danger");
      let reply = cursor.textContent;
      reply += event.target.getAttribute("id").slice(-1);
      reply = limitReplyText(reply);
      cursor.textContent = reply;
      const answer = cursor.dataset.answer;
      checkAnswer(answer, reply, cursor);
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

function initCursor() {
  const table = document.getElementById("table");
  table.querySelector("td.table-danger").classList.remove("table-danger");
  table.querySelector("td").classList.add("table-danger");
}

function initTable() {
  initTableHeader();
  initTableAnswers();
  initCursor();
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

function randomSigns(length) {
  const halfLength = length / 2;
  const arr = new Array(length);
  for (let i = 0; i < length; i++) {
    const sign = (i < halfLength) ? 1 : -1;
    arr[i] = sign;
  }
  return shuffle(arr);
}

function initTableHeaderBase(to, from, ths, grade) {
  const n = ths.length;
  let range = Array.from(new Array(to - from + 1)).map((_v, i) => i + from);
  while (range.length < n) {
    range = range.concat(range);
  }
  shuffle(range);
  const signs = randomSigns(n);
  const arr = range.slice(0, n);
  if (grade >= 6) arr.forEach((v, i) => arr[i] = v * signs[i]);
  for (let i = 0; i < n; i++) {
    ths[i].textContent = arr[i];
  }
}

function initTableHeader() {
  const table = document.getElementById("table");
  const ths = [...table.getElementsByTagName("th")];
  const grade = document.getElementById("gradeOption").selectedIndex + 1;
  const course = document.getElementById("courseOption").selectedIndex;
  if (course == 1 || course == 3) {
    const range = getNumRange(grade)[course];
    const [upperTo, upperFrom] = range[0];
    const [leftTo, leftFrom] = range[1];
    initTableHeaderBase(upperTo, upperFrom, ths.slice(1, 11), grade);
    initTableHeaderBase(leftTo, leftFrom, ths.slice(11), grade);
  } else {
    const [to, from] = getNumRange(grade)[course];
    initTableHeaderBase(to, from, ths.slice(1, 11), grade);
    initTableHeaderBase(to, from, ths.slice(11), grade);
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

function changeCalcMode(event) {
  if (event.target.selectedIndex >= 5) {
    document.getElementById("be").classList.add("d-none");
    document.getElementById("bs").classList.remove("d-none");
  } else {
    document.getElementById("be").classList.remove("d-none");
    document.getElementById("bs").classList.add("d-none");
  }
}

initTable();
initTableFontSize();
initCalc();

document.getElementById("toggleDarkMode").onclick = toggleDarkMode;
document.getElementById("startButton").onclick = countdown;
document.getElementById("restartButton").onclick = countdown;
document.getElementById("gradeOption").onchange = (event) => {
  changeCalcMode(event);
  initTable();
};
document.getElementById("courseOption").onchange = (event) => {
  const obj = event.target;
  const text = obj.options[obj.selectedIndex].textContent;
  document.getElementById("courseText").textContent = text;
  initTable();
};
globalThis.onresize = initTableFontSize;
document.addEventListener("pointerdown", unlockAudio, { once: true });
document.addEventListener("keydown", unlockAudio, { once: true });
