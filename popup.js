const timerDisplay = document.getElementById("timer");
const sessionDisplay = document.getElementById("sessionType");
const cycleDisplay = document.getElementById("cycleCount");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const stopBtn = document.getElementById("stopBtn");

const alarmAudio = new Audio("alarm.wav");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "playSound") {
    alarmAudio.play();
  }
});

let interval;

function updateUI(state) {
  const minutes = Math.floor(state.remainingTime / 60).toString().padStart(2, '0');
  const seconds = (state.remainingTime % 60).toString().padStart(2, '0');
  timerDisplay.textContent = `${minutes}:${seconds}`;

  sessionDisplay.textContent = state.sessionType === "focus"
    ? "Focus"
    : (state.sessionType === "short-break" ? "Short Break" : "Long Break");

  cycleDisplay.textContent = `🍅 Pomodoros: ${state.pomodoroCount}`;
}

function getTimerStateAndUpdate() {
  chrome.runtime.sendMessage({ type: 'getState' }, (response) => {
    if (response) {
      updateUI(response);
    }
  });
}

// Repeatedly sync UI with background
interval = setInterval(getTimerStateAndUpdate, 1000);

startBtn.addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: 'start' });
});

pauseBtn.addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: 'pause' });
});

stopBtn.addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: 'stop' });
});

getTimerStateAndUpdate();
