// Initialize extension state
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ analysisEnabled: false });
  console.log("Extension installed");
});

// Inject content script if not already present
async function ensureContentScriptInjected(tabId) {
  try {
    // Try to send a test message to check if content script is loaded
    await chrome.tabs.sendMessage(tabId, { action: "ping" });
  } catch (error) {
    // If content script is not loaded, inject it
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ["content.js"]
    });
  }
}

// Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggleAnalysis") {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (tabs[0]) {
        try {
          await ensureContentScriptInjected(tabs[0].id);
          chrome.tabs.sendMessage(tabs[0].id, {
            action: "toggleAnalysis",
            enabled: request.enabled
          });
        } catch (error) {
          console.error('Error:', error);
        }
      }
    });
  }
  return true; // Keep message channel open for async response
});

// Handle tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    chrome.storage.local.get(['analysisEnabled'], async (result) => {
      if (result.analysisEnabled) {
        try {
          await ensureContentScriptInjected(tabId);
          chrome.tabs.sendMessage(tabId, {
            action: "toggleAnalysis",
            enabled: true
          });
        } catch (error) {
          console.error('Error:', error);
        }
      }
    });
  }
});