function getActiveTab() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs || !tabs[0]) {
        return reject(new Error("No active tab found."));
      }
      resolve(tabs[0]);
    });
  });
}

function executeScript(tabId, details) {
  return new Promise((resolve, reject) => {
    chrome.scripting.executeScript(
      { target: { tabId }, ...details },
      (results) => {
        if (chrome.runtime.lastError) {
          return reject(new Error(chrome.runtime.lastError.message));
        }
        resolve(results);
      }
    );
  });
}

async function copyText(text, successMessage) {
  try {
    await navigator.clipboard.writeText(text);
    alert(successMessage);
  } catch (error) {
    console.error(error);
    alert("Unable to copy text to clipboard.");
  }
}

function getImageExtension(url) {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname;
    const rawExt = path.split(".").pop().split(/[#?]/)[0];
    if (rawExt && rawExt.length <= 5) {
      return `.${rawExt}`;
    }
  } catch (error) {
    // ignore invalid URL
  }

  if (url.startsWith("data:image/png")) return ".png";
  if (url.startsWith("data:image/jpeg") || url.startsWith("data:image/jpg")) return ".jpg";
  if (url.startsWith("data:image/gif")) return ".gif";
  return ".jpg";
}

// 1. Copy all code blocks
 document.getElementById("copyCode").onclick = async () => {
  try {
    const tab = await getActiveTab();
    const results = await executeScript(tab.id, { files: ["copyCode.js"] });
    const text = results?.[0]?.result || "";

    if (!text.trim()) {
      return alert("No code blocks were found on this page.");
    }

    await copyText(text, "Copied all code blocks!");
  } catch (error) {
    console.error(error);
    alert("Failed to copy code blocks.");
  }
};

// 2. Clean URL
 document.getElementById("cleanUrl").onclick = async () => {
  try {
    const tab = await getActiveTab();
    const results = await executeScript(tab.id, {
      func: () => {
        const url = new URL(window.location.href);
        url.search = "";
        return url.toString();
      }
    });
    const cleanUrl = results?.[0]?.result || "";

    if (!cleanUrl) {
      return alert("Unable to generate a clean URL.");
    }

    await copyText(cleanUrl, "Clean URL copied!");
  } catch (error) {
    console.error(error);
    alert("Failed to clean the URL.");
  }
};

async function getPageText(tabId) {
  const results = await executeScript(tabId, {
    func: () => {
      const raw = document.body?.innerText || "";
      return raw.trim().replace(/\s{2,}/g, " ");
    }
  });
  return results?.[0]?.result || "";
}

async function getPageLinks(tabId) {
  const results = await executeScript(tabId, {
    func: () => {
      const links = Array.from(document.querySelectorAll("a[href]"))
        .map((link) => link.href.trim())
        .filter((href) => href && href !== "#" && !href.startsWith("javascript:"));
      return Array.from(new Set(links));
    }
  });
  return results?.[0]?.result || [];
}

document.getElementById("copyText").onclick = async () => {
  try {
    const tab = await getActiveTab();
    const text = await getPageText(tab.id);
    if (!text) {
      return alert("No visible text found on this page.");
    }
    await copyText(text, "Visible page text copied!");
  } catch (error) {
    console.error(error);
    alert("Failed to copy visible text.");
  }
};

document.getElementById("extractLinks").onclick = async () => {
  try {
    const tab = await getActiveTab();
    const links = await getPageLinks(tab.id);
    if (!links.length) {
      return alert("No links were found on this page.");
    }
    await copyText(links.join("\n"), `Copied ${links.length} links to clipboard!`);
  } catch (error) {
    console.error(error);
    alert("Failed to extract links.");
  }
};

document.getElementById("focusMode").onclick = async () => {
  try {
    const tab = await getActiveTab();
    const results = await executeScript(tab.id, {
      func: () => {
        const styleId = "__smooth_focus_style";
        const active = !!document.getElementById(styleId);
        if (active) {
          document.getElementById(styleId).remove();
          document.documentElement.classList.remove("smooth-focus");
          return false;
        }

        const style = document.createElement("style");
        style.id = styleId;
        style.textContent = `
          html.smooth-focus body::before {
            content: "";
            position: fixed;
            inset: 0;
            background: rgba(10, 12, 32, 0.64);
            pointer-events: none;
            z-index: 2147483647;
            backdrop-filter: blur(8px);
          }
          html.smooth-focus body > * {
            filter: brightness(0.85) saturate(0.92) blur(0.8px);
          }
          html.smooth-focus body > #__smooth_focus_hud {
            position: fixed;
            right: 16px;
            bottom: 16px;
            z-index: 2147483648;
            padding: 10px 14px;
            border-radius: 14px;
            background: rgba(255, 255, 255, 0.12);
            color: #eff4ff;
            font-size: 12px;
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255,255,255,0.18);
          }
        `;
        document.head.appendChild(style);

        const hud = document.createElement("div");
        hud.id = "__smooth_focus_hud";
        hud.innerText = "Focus mode enabled — click again to exit.";
        document.body.appendChild(hud);

        document.documentElement.classList.add("smooth-focus");
        return true;
      }
    });

    alert(results?.[0]?.result ? "Focus mode enabled." : "Focus mode disabled.");
  } catch (error) {
    console.error(error);
    alert("Failed to toggle focus mode.");
  }
};

document.getElementById("readAloud").onclick = async () => {
  try {
    const tab = await getActiveTab();
    const results = await executeScript(tab.id, {
      func: () => {
        const title = document.title || "This page";
        const paragraphs = Array.from(document.querySelectorAll("p"))
          .slice(0, 4)
          .map((p) => p.innerText.trim())
          .filter(Boolean);
        const text = [title, ...paragraphs].join(". ");

        if (!window.speechSynthesis) {
          return { success: false, message: "Speech synthesis is not supported." };
        }

        if (window.__smoothSpeechUtterance) {
          window.speechSynthesis.cancel();
          window.__smoothSpeechUtterance = null;
        }

        if (!text) {
          return { success: false, message: "No readable text found." };
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;
        utterance.pitch = 1.05;
        window.__smoothSpeechUtterance = utterance;
        window.speechSynthesis.speak(utterance);

        return { success: true };
      }
    });

    if (!results?.[0]?.result?.success) {
      return alert(results?.[0]?.result?.message || "Unable to read page aloud.");
    }

    alert("Reading page aloud...");
  } catch (error) {
    console.error(error);
    alert("Failed to read the page aloud.");
  }
};

// 3. Auto scroll
// --- Auto Scroll with Tap-Based Speed Control ---
let scrollClicks = 0;
let scrollTimeout = null;
let scrollActive = false;

function getAutoScrollSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["scrollSpeed", "tapControl"], (data) => {
      resolve({
        scrollSpeed: data.scrollSpeed || "medium",
        tapControl: data.tapControl ?? true
      });
    });
  });
}

async function stopAutoScroll(tabId) {
  await executeScript(tabId, {
    func: () => {
      if (window.__smoothScrollInterval) {
        cancelAnimationFrame(window.__smoothScrollInterval);
        window.__smoothScrollInterval = null;
      }
    }
  });
}

async function runAutoScroll(tabId, speed) {
  await executeScript(tabId, {
    func: (speed) => {
      if (window.__smoothScrollInterval) {
        cancelAnimationFrame(window.__smoothScrollInterval);
      }

      const step = () => {
        window.scrollBy({ top: speed, left: 0 });
        window.__smoothScrollInterval = requestAnimationFrame(step);
      };

      step();
    },
    args: [speed]
  });
}

document.getElementById("autoScroll").onclick = async () => {
  try {
    const tab = await getActiveTab();
    const settings = await getAutoScrollSettings();
    const speedValue = { slow: 2, medium: 6, fast: 12 };

    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      scrollClicks = 0;
    }, 400);

    if (!settings.tapControl) {
      if (scrollActive) {
        await stopAutoScroll(tab.id);
        alert("Scrolling stopped.");
        scrollActive = false;
        scrollClicks = 0;
        return;
      }

      await runAutoScroll(tab.id, speedValue[settings.scrollSpeed]);
      scrollActive = true;
      alert(`Auto scroll started at ${settings.scrollSpeed} speed.`);
      return;
    }

    scrollClicks += 1;

    if (scrollClicks >= 4) {
      await stopAutoScroll(tab.id);
      alert("Scrolling stopped.");
      scrollActive = false;
      scrollClicks = 0;
      return;
    }

    const speedLabels = ["slow", "medium", "fast"];
    const speedLabel = speedLabels[scrollClicks - 1] || settings.scrollSpeed;
    const speed = speedValue[speedLabel];

    await runAutoScroll(tab.id, speed);
    scrollActive = true;
    alert(`Auto scroll started at ${speedLabel} speed.`);
  } catch (error) {
    console.error(error);
    alert("Auto scroll failed.");
  }
};


// 4. Download all images
 document.getElementById("downloadImages").onclick = async () => {
  try {
    const tab = await getActiveTab();
    const results = await executeScript(tab.id, {
      func: () => {
        const imageUrls = Array.from(document.images)
          .map((img) => img.currentSrc || img.src)
          .filter(Boolean);
        return Array.from(new Set(imageUrls));
      }
    });
    const imageUrls = results?.[0]?.result || [];

    if (!imageUrls.length) {
      return alert("No images found on this page.");
    }

    for (let i = 0; i < imageUrls.length; i += 1) {
      const url = imageUrls[i];
      chrome.downloads.download({
        url,
        filename: `smooth-action-image-${i + 1}${getImageExtension(url)}`,
        conflictAction: "uniquify"
      }, (downloadId) => {
        if (chrome.runtime.lastError) {
          console.warn("Download failed for", url, chrome.runtime.lastError.message);
        }
      });
    }

    alert(`Starting download for ${imageUrls.length} image${imageUrls.length === 1 ? "" : "s"}.`);
  } catch (error) {
    console.error(error);
    alert("Failed to download images.");
  }
};
