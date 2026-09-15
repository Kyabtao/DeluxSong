// TCS AdBlocker — Background Service Worker for Extension
// Blocks ad requests using declarativeNetRequest would be better, but for MV3 demo we use simple counting

let blockedCount = 0;

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "AD_BLOCKED") {
    blockedCount += msg.count || 1;
    chrome.action.setTitle({ title: `TCS AdBlocker — ${blockedCount} blocked` });
    chrome.storage.local.set({ blockedCount });
  }
  if (msg.type === "GET_COUNT") {
    sendResponse({ blockedCount });
  }
});

chrome.storage.local.get(["blockedCount"], (res) => {
  if (res.blockedCount) blockedCount = res.blockedCount;
});
