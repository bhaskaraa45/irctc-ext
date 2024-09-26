chrome.webNavigation.onCompleted.addListener(function(details) {
    if (details.url.includes("www.irctc.co.in")) {
        chrome.tabs.executeScript(details.tabId, { file: "content.js" });
    }
});
