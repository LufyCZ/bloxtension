interface CreateLinkMenu {
  explorers: {
    name: string
    url: string
  }[]
}

const contextMenuPrefix = "bloxtension-link-menu"

export function createLinkMenu({ explorers: _explorers }: CreateLinkMenu) {
  console.log('createLinkMenu')
  chrome.contextMenus.create({
    id: contextMenuPrefix,
    enabled: true,
    title: "Blockscout",
    contexts: ["selection"],
  });

  const explorers = _explorers.map((explorer) => ({
    ...explorer,
    id: `${contextMenuPrefix}-${explorer.name.replaceAll(" ", "-")}`
  }))

  for (const explorer of explorers) {
    chrome.contextMenus.create({
      id: explorer.id,
      title: explorer.name,
      parentId: contextMenuPrefix,
    });
  }

  chrome.contextMenus.onClicked.addListener((info, tab) => {
    console.log('onClicked', info, tab)
    if (info.parentMenuItemId !== contextMenuPrefix) {
      return
    }

    const explorer = explorers.find((e) => e.id === info.menuItemId)

    if (!explorer) {
      return
    }

    if (chrome.tabs && chrome.tabs.executeScript) {
      chrome.tabs.create({
        active: true,
        index: tab.index + 1,
        url: explorer.url
      })
    }
  });

  chrome.runtime.onMessage.addListener((message: { type: "selection", text: string }, sender, sendResponse) => {
    console.log("onMessage:selection", message)
    if (message.type === "selection" && message.text) {
      const txHashM = message.text.match(/0x[a-fA-F0-9]{64}/)
      const addressM = message.text.match(/0x[a-fA-F0-9]{40}/)

      const txHash = txHashM ? txHashM[0] : null
      const address = addressM ? addressM[0] : null

      if (txHash || address) {
        chrome.contextMenus.update(contextMenuPrefix, { enabled: true });
      } else {
        chrome.contextMenus.update(contextMenuPrefix, { enabled: false });
      }
    }
    // Don't return anything - let other listeners handle their messages
  });
}