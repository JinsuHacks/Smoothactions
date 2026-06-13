function createFloatingButton() {
  const btn = document.createElement("div");
  btn.id = "smoothactions-btn";
  btn.innerText = "0_0";
  document.body.appendChild(btn);

  btn.addEventListener("click", () => {
    chrome.runtime.sendMessage({ type: "openPopup" }, () => {
      if (chrome.runtime.lastError) {
        console.warn("SmoothActions message failed:", chrome.runtime.lastError.message);
      }
    });
  });
}

function init() {
  if (window.top !== window.self) {
    return;
  }

  if (!document.body) {
    document.addEventListener("DOMContentLoaded", createFloatingButton, { once: true });
    return;
  }

  createFloatingButton();
}

init();
