const countPanel=document.getElementById("countPanel"),infoPanel=document.getElementById("infoPanel"),scorePanel=document.getElementById("scorePanel"),audioContext=new AudioContext,audioBufferCache={};loadAudio("end","mp3/end.mp3"),loadAudio("correct","mp3/correct3.mp3");let japaneseVoices=[];loadVoices();let correctCount=0;loadConfig();function loadConfig(){localStorage.getItem("darkMode")==1&&document.documentElement.setAttribute("data-bs-theme","dark")}function toggleDarkMode(){localStorage.getItem("darkMode")==1?(localStorage.setItem("darkMode",0),document.documentElement.setAttribute("data-bs-theme","light")):(localStorage.setItem("darkMode",1),document.documentElement.setAttribute("data-bs-theme","dark"))}function loadVoices(){const e=new Promise(function(e){let t=speechSynthesis.getVoices();if(t.length!==0)e(t);else{let n=!1;speechSynthesis.addEventListener("voiceschanged",()=>{n=!0,t=speechSynthesis.getVoices(),e(t)}),setTimeout(()=>{n||document.getElementById("noTTS").classList.remove("d-none")},1e3)}});e.then(e=>{japaneseVoices=e.filter(e=>e.lang=="ja-JP")})}function speak(e){speechSynthesis.cancel();const t=new SpeechSynthesisUtterance(e);t.voice=japaneseVoices[Math.floor(Math.random()*japaneseVoices.length)],t.lang="ja-JP",speechSynthesis.speak(t)}async function playAudio(e,t){const s=await loadAudio(e,audioBufferCache[e]),n=audioContext.createBufferSource();if(n.buffer=s,t){const e=audioContext.createGain();e.gain.value=t,e.connect(audioContext.destination),n.connect(e),n.start()}else n.connect(audioContext.destination),n.start()}async function loadAudio(e,t){if(audioBufferCache[e])return audioBufferCache[e];const s=await fetch(t),o=await s.arrayBuffer(),n=await audioContext.decodeAudioData(o);return audioBufferCache[e]=n,n}function unlockAudio(){audioContext.resume()}function getNumRange(e){switch(e){case 1:return[[9,1],[[10,5],[5,1]],[9,1],[[9,1],[5,1]]];case 2:return[[14,2],[[20,11],[10,1]],[9,1],[[19,1],[5,1]]];case 3:return[[19,4],[[26,16],[15,6]],[9,1],[[99,10],[9,1]]];case 4:return[[24,8],[[99,50],[50,11]],[9,1],[[99,20],[19,11]]];default:return[[49,11],[[99,50],[50,11]],[9,1],[[99,20],[19,11]]]}}let startTime,gameTimer;function startGameTimer(){correctCount=0,clearInterval(gameTimer);const e=document.getElementById("time");startTime=Date.now(),gameTimer=setInterval(()=>{e.textContent=(Date.now()-startTime)/1e3},200)}let countdownTimer;function countdown(){initTable(),clearTimeout(countdownTimer),countPanel.classList.remove("d-none"),infoPanel.classList.add("d-none"),scorePanel.classList.add("d-none");const e=document.getElementById("counter");e.textContent=3,countdownTimer=setInterval(()=>{const t=["skyblue","greenyellow","violet","tomato"];if(parseInt(e.textContent)>1){const n=parseInt(e.textContent)-1;e.style.backgroundColor=t[n],e.textContent=n}else clearTimeout(countdownTimer),countPanel.classList.add("d-none"),infoPanel.classList.remove("d-none"),startGameTimer()},1e3)}function initTableFontSize(){const e=document.getElementById("table"),t=e.offsetWidth;e.style.fontSize=t/11*.6+"px"}function initCalc(){document.getElementById("be").onclick=()=>{const e=document.getElementById("table").querySelector(".table-danger"),t=e.dataset.answer;speak(t)},document.getElementById("bc").onclick=()=>{const e=document.getElementById("table").querySelector(".table-danger");e.textContent=""};for(let e=0;e<10;e++)document.getElementById("b"+e).onclick=e=>{const n=document.getElementById("table").querySelector(".table-danger");let t=n.textContent;t+=e.target.getAttribute("id").slice(-1),t.length>2&&(t=t.slice(1,3)),n.textContent=t;const s=n.dataset.answer;if(s==t&&(playAudio("correct",.3),correctCount+=1,moveCursorNext(n),correctCount==100)){playAudio("end"),clearInterval(gameTimer),infoPanel.classList.add("d-none"),scorePanel.classList.remove("d-none");const e=(Date.now()-startTime)/1e3;document.getElementById("score").textContent=e}}}function shuffle(e){for(let t=e.length;1<t;t--){const n=Math.floor(Math.random()*t);[e[n],e[t-1]]=[e[t-1],e[n]]}return e}function initTable(){initTableHeader(),initTableAnswers(),[...document.getElementById("table").querySelectorAll("td.table-danger")].forEach(e=>{e.className=""}),document.getElementById("table").getElementsByTagName("tr")[1].children[1].className="table-danger"}function initTableAnswers(){const e=document.getElementById("courseOption").selectedIndex,t=document.getElementById("table").getElementsByTagName("tr"),n=t[0].children;for(let o=1;o<t.length;o++){const s=t[o].children;for(let t=1;t<s.length;t++){let o;const i=parseInt(n[t].textContent),a=parseInt(s[0].textContent);e==0?o=i+a:e==1?o=i-a:e==2?o=i*a:o=Math.floor(i/a),s[t].dataset.answer=o,s[t].textContent=""}}}function initTableHeader(){const s=document.getElementById("table"),t=s.getElementsByTagName("th"),n=document.getElementById("gradeOption").selectedIndex+1,e=document.getElementById("courseOption").selectedIndex;if(e==1||e==3){let[a,o]=getNumRange(n)[e][0],i=Array.from(new Array(a-o+1)).map((e,t)=>t+o),s=shuffle(i.slice());s=s.concat(shuffle(i.slice()));for(let e=1;e<=10;e++)t[e].textContent=s[e];[a,o]=getNumRange(n)[e][1],i=Array.from(new Array(a-o+1)).map((e,t)=>t+o),s=shuffle(i.slice()),s=s.concat(shuffle(i.slice()));for(let e=11;e<=20;e++)t[e].textContent=s[e-11]}else{const[a,i]=getNumRange(n)[e],s=Array.from(new Array(a-i+1)).map((e,t)=>t+i);let o=shuffle(s);o=o.concat(shuffle(s.slice())).concat(shuffle(s.slice()));for(let e=1;e<=20;e++)t[e].textContent=o[e]}}function moveCursorNext(e){const i=e.parentNode,n=[...document.getElementById("table").getElementsByTagName("tr")],a=[...e.parentNode.children],s=a.indexOf(e),o=n.indexOf(i);let t;o==10?s==10?t=e:t=n[1].children[s+1]:t=n[o+1].children[s],e.className="",t.className="table-danger"}initTable(),initTableFontSize(),initCalc(),document.getElementById("toggleDarkMode").onclick=toggleDarkMode,document.getElementById("startButton").onclick=countdown,document.getElementById("restartButton").onclick=countdown,document.getElementById("gradeOption").onchange=initTable,window.onresize=initTableFontSize,document.getElementById("courseOption").onchange=e=>{const t=e.target,n=t.options[t.selectedIndex].textContent;document.getElementById("courseText").innerHTML=n,initTable()},document.addEventListener("click",unlockAudio,{once:!0,useCapture:!0})