chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "studylens-explain",
    title: "Explain with StudyLens AI",
    contexts: ["selection"]
  });
});

chrome.action.onClicked.addListener(async (tab) => {
  if (tab.windowId !== undefined) {
    await chrome.sidePanel.open({ windowId: tab.windowId });
  }
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== "studylens-explain" || !info.selectionText || !tab?.windowId) {
    return;
  }

  await chrome.sidePanel.open({ windowId: tab.windowId });

  await chrome.storage.session.set({
    pendingSelection: info.selectionText
  });
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command === "open-side-panel") {
    const windows = await chrome.windows.getCurrent();
    if (windows.id !== undefined) {
      await chrome.sidePanel.open({ windowId: windows.id });
    }
  }
});
