// prevent duplicate contextMenus
chrome.contextMenus.removeAll();

// create parent contextMenus
chrome.contextMenus.create({
    title: "Copy link to highlight Advanced",
    contexts: ["selection"],
    id: "parent"
});

// create sub contextMenus
for (let i = 1; i <= 4; i++) {
    chrome.contextMenus.create({
        title: `Format ${i}`,
        contexts: ["selection"],
        parentId: "parent",
        id: `copy-format-${i}`
    });
}

// contextMenus event
chrome.contextMenus.onClicked.addListener(function (info, tab) {
    chrome.tabs.sendMessage(tab.id, { message: info.menuItemId });
});

// shortcut event
chrome.commands.onCommand.addListener((command, tab) => {
    chrome.tabs.sendMessage(tab.id, { message: command });
});
