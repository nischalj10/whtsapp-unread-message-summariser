chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'displayUnreadMessages') {
    chrome.tabs.create(
      {
        url: chrome.runtime.getURL('result.html'),
      },
      (tab) => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
          return;
        }

        const messageListener = (tabId, changeInfo) => {
          if (tabId === tab.id && changeInfo.status === 'complete') {
            chrome.tabs.onUpdated.removeListener(messageListener);

            // Delay sending the message to ensure the content script is loaded
            setTimeout(() => {
              chrome.tabs.sendMessage(
                tabId,
                { messages: request.messages },
                (response) => {
                  if (chrome.runtime.lastError) {
                    console.error(
                      'Error sending message:',
                      chrome.runtime.lastError
                    );
                  }
                }
              );
            }, 500);
          }
        };

        chrome.tabs.onUpdated.addListener(messageListener);
      }
    );
  }
});
