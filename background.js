let timer = null;
let remainingTime = 25 * 60; // 25 mins
let sessionType = 'focus'; // 'focus', 'short-break', 'long-break'
let pomodoroCount = 0;
let isRunning = false;

// 🔔 Update badge text
function updateBadge(time) {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  const text = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  chrome.action.setBadgeText({ text });
  chrome.action.setBadgeBackgroundColor({
    color: sessionType === 'focus' ? '#FF4500' : '#32CD32' // red for focus, green for break
  });
}

function startTimer() {
  if (isRunning) return;
  isRunning = true;

  updateBadge(remainingTime); // 🆕 Immediately show badge when timer starts

  timer = setInterval(() => {
    remainingTime--;

    updateBadge(remainingTime); // 🆕 Update badge every tick

    if (remainingTime <= 0) {
      clearInterval(timer);
      isRunning = false;
      handleSessionComplete();
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(timer);
  isRunning = false;
}

function stopTimer() {
  clearInterval(timer);
  isRunning = false;
  sessionType = 'focus';
  remainingTime = 25 * 60; // reset to 25 mins
  pomodoroCount = 0;
  chrome.action.setBadgeText({ text: '' }); // 🆕 Clear badge
}

function handleSessionComplete() {
  function notifyPopupSound(type) {
    chrome.runtime.sendMessage({ type: "playSound", session: type });
  }

  if (sessionType === 'focus') {
    pomodoroCount++;
    showNotification("Focus session over! Time for a break.");
    notifyPopupSound('break');

    if (pomodoroCount % 4 === 0) {
      sessionType = 'long-break';
      remainingTime = 15 * 60; // 15 mins long break
    } else {
      sessionType = 'short-break';
      remainingTime = 5 * 60; // 5 min short break
    }
  } else {
    showNotification("Break over! Time to focus.");
    notifyPopupSound('focus');
    sessionType = 'focus';
    remainingTime = 25 * 60;
  }

  updateBadge(remainingTime); // 🆕 Badge resets for next session
  startTimer(); // Auto-start next session
}

function showNotification(message) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "focus128.png",
    title: "Pomodoro Timer",
    message: message
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'start':
      startTimer();
      break;
    case 'pause':
      pauseTimer();
      break;
    case 'stop':
      stopTimer();
      break;
    case 'getState':
      sendResponse({
        remainingTime,
        sessionType,
        pomodoroCount,
        isRunning
      });
      break;
  }
});
