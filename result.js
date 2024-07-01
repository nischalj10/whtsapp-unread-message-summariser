chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  document.getElementById('messages').textContent = JSON.stringify(
    request.messages,
    null,
    2
  );
});
