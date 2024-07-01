//add the menu option on whatsapp ui
function insertGetArrayOption(menu) {
  // Check if our option already exists
  if (menu.querySelector('#get-unread-array')) {
    return;
  }

  const newOption = document.createElement('li');
  newOption.className = '_aj-r _aj-q _aj-_';
  newOption.tabIndex = 0;
  newOption.style = 'opacity : 1';
  newOption.setAttribute('data-animate-dropdown-item', 'true');

  // Add hover effect
  newOption.addEventListener('mouseenter', () => {
    newOption.className = '_aj-s _aj-r _aj-q _aj-_';
  });
  newOption.addEventListener('mouseleave', () => {
    newOption.className = '_aj-r _aj-q _aj-_';
  });

  const innerDiv = document.createElement('div');
  innerDiv.id = 'get-unread-array';
  innerDiv.className = '_aj-z _aj-t _alxo';
  innerDiv.setAttribute('role', 'button');
  innerDiv.setAttribute('aria-label', 'get unread messages');
  innerDiv.textContent = 'Get Unread Messages';
  innerDiv.addEventListener('click', getUnreadMessages);

  newOption.appendChild(innerDiv);
  // Find the div inside ul._ak5b and append the new option to it
  const menuInnerDiv = menu.querySelector('div');
  if (menuInnerDiv) {
    menuInnerDiv.appendChild(newOption);
  } else {
    console.log(
      "WhatsApp Unread Messages Array: Couldn't find the inner div in the menu",
      menu
    );
  }
}
//helper function to add the menu option on whatsapp ui
function addGetArrayOption() {
  // Wait for the menu to be open
  const menuObserver = new MutationObserver((mutations, obs) => {
    const menu = document.querySelector('ul._ak5b');
    if (menu) {
      obs.disconnect();
      insertGetArrayOption(menu);
    }
  });

  menuObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

// start observing for menu opens
document.addEventListener('click', addGetArrayOption);
addGetArrayOption();

// main function which takes care of getting all the unread messages
async function getUnreadMessages() {
  // Find and click on the chat with unread messages
  const unreadChat = document.querySelector(
    'div[aria-label*="unread message"]'
  );
  if (!unreadChat) {
    console.error("Couldn't find a chat with unread messages");
    return [];
  }
  unreadChat.click();

  // Wait for the chat to load
  await new Promise((resolve) => setTimeout(resolve, 1000));

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

//helper of the main function
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

// helper of the main function
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

// Update the event listener in insertGetArrayOption
innerDiv.addEventListener('click', handleGetUnreadMessages);
