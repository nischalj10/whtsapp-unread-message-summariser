// Create and insert the summarize button
function insertSummarizeButton() {
  const header = document.querySelector('header');
  if (header && !document.getElementById('summarize-button')) {
    const button = document.createElement('button');
    button.id = 'summarize-button';
    button.textContent = 'Summarize Unread';
    button.style.marginLeft = '10px';
    button.style.padding = '5px 10px';
    button.style.backgroundColor = '#128C7E';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '3px';
    button.style.cursor = 'pointer';
    button.addEventListener('click', handleGetUnreadMessages);
    header.appendChild(button);
  }
}

// Observer to watch for changes in the chat area
const chatObserver = new MutationObserver((mutations) => {
  const unreadCountElement = document.querySelector(
    '._agtk[aria-live="polite"]'
  );
  const summarizeButton = document.getElementById('summarize-button');

  if (unreadCountElement) {
    if (!summarizeButton) {
      insertSummarizeButton();
    } else {
      summarizeButton.style.display = 'inline-block';
    }
  } else if (summarizeButton) {
    summarizeButton.style.display = 'none';
  }
});

// Create a function to check for the chat area
function checkForChatArea() {
  console.log('Checking for chat area...');
  const chatArea = document.querySelector('div._aigv._aigz');
  if (chatArea) {
    console.log('Chat area found, starting observer');
    chatObserver.observe(chatArea, { childList: true, subtree: true });
    return true;
  }
  console.log('Chat area not found yet');
  return false;
}

// Modify the startChatObserver function
function startChatObserver() {
  console.log('Starting chat observer');
  if (!checkForChatArea()) {
    // If chat area is not found, set up a MutationObserver to watch for it
    const bodyObserver = new MutationObserver((mutations) => {
      if (checkForChatArea()) {
        bodyObserver.disconnect();
      }
    });
    bodyObserver.observe(document.body, { childList: true, subtree: true });
  }
}

// Modify the initExtension function
function initExtension() {
  console.log('Initializing extension');
  // Start the chat observer immediately
  startChatObserver();
  // Also set up a click event listener on the document
  document.addEventListener('click', () => {
    setTimeout(checkForChatArea, 500);
  });
}

// Run the initialization when the page loads
window.addEventListener('load', initExtension);

// Main function to get unread messages
async function getUnreadMessages() {
  // Find the unread messages count element
  const unreadCountElement = document.querySelector(
    '._agtk[aria-live="polite"]'
  );
  if (!unreadCountElement) {
    console.error("Couldn't find unread messages count element");
    return [];
  }

  // Extract the number of unread messages
  const unreadCount = parseInt(unreadCountElement.textContent);
  if (isNaN(unreadCount) || unreadCount === 0) {
    console.log('No unread messages found');
    return [];
  }

  // Scroll to the bottom of the chat
  await scrollToBottom();

  // Wait for messages to load
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Get all message containers
  const messageContainers = document.querySelectorAll(
    '[data-testid="msg-container"]'
  );

  // Find the last unread message
  let lastUnreadIndex = -1;
  for (let i = messageContainers.length - 1; i >= 0; i--) {
    const unreadIndicator = messageContainers[i].querySelector(
      '[data-testid="msg-dblcheck"]'
    );
    if (unreadIndicator && !unreadIndicator.classList.contains('read')) {
      lastUnreadIndex = i;
      break;
    }
  }

  if (lastUnreadIndex === -1) {
    console.error("Couldn't find any unread messages");
    return [];
  }

  // Collect unread messages
  const unreadMessages = [];
  for (
    let i = Math.max(0, lastUnreadIndex - unreadCount + 1);
    i <= lastUnreadIndex;
    i++
  ) {
    const messageText = messageContainers[i].querySelector(
      '[data-testid="msg-text"]'
    )?.textContent;
    if (messageText) {
      unreadMessages.push(messageText);
    }
  }

  return unreadMessages;
}

// Helper function to scroll to the bottom of the chat
async function scrollToBottom() {
  const scrollButton = document.querySelector(
    'div[aria-label="Scroll to bottom"]'
  );
  if (scrollButton) {
    scrollButton.click();
    // Wait for scrolling to complete
    await new Promise((resolve) => setTimeout(resolve, 500));
  } else {
    console.warn("Couldn't find scroll to bottom button");
  }
}

// Handle the click event on the Summarize Unread button
function handleGetUnreadMessages() {
  getUnreadMessages()
    .then((messages) => {
      chrome.runtime.sendMessage({
        action: 'displayUnreadMessages',
        messages: messages,
      });
    })
    .catch((error) => {
      console.error('Error getting unread messages:', error);
    });
}
