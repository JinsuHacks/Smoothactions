// Load saved settings
chrome.storage.sync.get(
  ["scrollSpeed", "tapControl", "zipImages"],
  (data) => {
    document.getElementById("scrollSpeed").value = data.scrollSpeed || "medium";
    document.getElementById("tapControl").checked = data.tapControl ?? true;
    document.getElementById("zipImages").checked = data.zipImages ?? false;
  }
);

// Save settings
document.getElementById("saveBtn").onclick = () => {
  const settings = {
    scrollSpeed: document.getElementById("scrollSpeed").value,
    tapControl: document.getElementById("tapControl").checked,
    zipImages: document.getElementById("zipImages").checked
  };

  chrome.storage.sync.set(settings, () => {
    const status = document.getElementById("status");
    status.textContent = "Settings saved!";
    setTimeout(() => (status.textContent = ""), 1500);
  });
};
