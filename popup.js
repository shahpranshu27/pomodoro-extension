const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const stopBtn = document.getElementById("stopBtn");
const timerDisplay = document.getElementById("timer");

startBtn.addEventListener("click", () => {
  chrome.runtime.sendMessage({ command: "start", duration: 25 * 60 });
});

pauseBtn.addEventListener("click", () => {
  chrome.runtime.sendMessage({ command: "pause" });
});

stopBtn.addEventListener("click", () => {
  chrome.runtime.sendMessage({ command: "stop" });
});

function formatTime(ms) {
  const mins = Math.floor(ms / 1000 / 60);
  const secs = Math.floor((ms / 1000) % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function updateTimer() {
  chrome.storage.local.get(["remaining", "isRunning"], (data) => {
    if (data.remaining !== undefined) {
      timerDisplay.textContent = formatTime(data.remaining);
    }
  });
}

// Immediately show correct time
updateTimer();  

// Keep updating every second
setInterval(updateTimer, 1000);
