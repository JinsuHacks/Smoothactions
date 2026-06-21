async function loadSettings() {
  const data = await new Promise((resolve) => {
    chrome.storage.sync.get(["scrollSpeed", "tapControl", "zipImages"], resolve);
  });

  document.getElementById("scrollSpeed").value = data.scrollSpeed || "medium";
  document.getElementById("tapControl").checked = data.tapControl ?? true;
  document.getElementById("zipImages").checked = data.zipImages ?? false;
}

async function saveSettings() {
  const settings = {
    scrollSpeed: document.getElementById("scrollSpeed").value,
    tapControl: document.getElementById("tapControl").checked,
    zipImages: document.getElementById("zipImages").checked
  };

  await new Promise((resolve) => chrome.storage.sync.set(settings, resolve));

  const status = document.getElementById("status");
  status.textContent = "Settings saved!";
  status.classList.add("visible");
  setTimeout(() => {
    status.classList.remove("visible");
    status.textContent = "";
  }, 1500);
}

document.getElementById("saveBtn").onclick = saveSettings;

loadSettings();
