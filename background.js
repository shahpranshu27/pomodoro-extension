let timerInterval = null;
let paused = false;
let pausedTime = 0;

function updateBadge(timeLeft) {
  const mins = Math.floor(timeLeft / 1000 / 60);
  const secs = Math.floor((timeLeft / 1000) % 60);
  chrome.action.setBadgeText({ text: `${mins}:${secs < 10 ? '0' : ''}${secs}` });
  chrome.action.setBadgeBackgroundColor({ color: '#e67e22' });
}

function startTimer(duration) {
  const endTime = Date.now() + duration;

  chrome.storage.local.set({ isRunning: true, endTime });

  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    const remaining = Math.max(0, endTime - Date.now());
    chrome.storage.local.set({ remaining });
    updateBadge(remaining);

    if (remaining <= 0) {
      clearInterval(timerInterval);
      chrome.storage.local.set({ isRunning: false });
      chrome.action.setBadgeText({ text: "" });

      chrome.notifications?.create({
        type: "basic",
        iconUrl: "focus128.png",
        title: "Pomodoro Complete!",
        message: "Take a break 🎉"
      });
    }
  }, 1000);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.command === "start") {
    chrome.storage.local.get(["isRunning", "remaining"], (data) => {
      if (data.isRunning) {
        // Already running, do nothing
        sendResponse({ status: "already_running" });
        return;
      }

      const duration = paused && pausedTime ? pausedTime : (message.duration || 25 * 60) * 1000;
      paused = false;
      pausedTime = 0;

      startTimer(duration);
      sendResponse({ status: "started" });
    });

    return true; // Needed for async sendResponse
  }

  if (message.command === "pause") {
    paused = true;
    clearInterval(timerInterval);
    chrome.storage.local.get("remaining", (data) => {
      pausedTime = data.remaining;
    });
    chrome.storage.local.set({ isRunning: false });
    chrome.action.setBadgeText({ text: "⏸" });
    sendResponse({ status: "paused" });
  }

  if (message.command === "stop") {
    clearInterval(timerInterval);
    paused = false;
    pausedTime = 0;
    chrome.storage.local.set({ isRunning: false, remaining: 0 });
    chrome.action.setBadgeText({ text: "" });
    sendResponse({ status: "stopped" });
  }
});
