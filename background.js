let timer = null;
let remainingTime = 25 * 60; // 25 mins
let sessionType = 'focus'; // 'focus', 'short-break', 'long-break'
let pomodoroCount = 0;
let isRunning = false;

function startTimer() {
  if (isRunning) return;
  isRunning = true;

  timer = setInterval(() => {
    remainingTime--;
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
}

function handleSessionComplete() {
  if (sessionType === 'focus') {
    pomodoroCount++;
    showNotification("Focus session over! Time for a break.");
    if (pomodoroCount % 4 === 0) {
      sessionType = 'long-break';
      remainingTime = 15 * 60; // 15 mins long-break
    } else {
      sessionType = 'short-break';
      remainingTime = 5 * 60; // 5 min short-break
    }
  } else {
    showNotification("Break over! Time to focus.");
    sessionType = 'focus';
    remainingTime = 25 * 60; // 25 mins
  }

  startTimer();
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

