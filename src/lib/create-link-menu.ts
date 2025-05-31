function extractSelection(text: string) {
  const txHashM = text.match(/0x[a-fA-F0-9]{64}/)
  const addressM = text.match(/0x[a-fA-F0-9]{40}/)

  const txHash = txHashM ? txHashM[0] : null
  const address = addressM ? addressM[0] : null

  if (txHash) return { type: "txHash", data: txHash } as const
  if (address) return { type: "address", data: address } as const
  return { type: 'none' } as const
}

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
    visible: true,
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
      title: `On ${explorer.name}`,
      parentId: contextMenuPrefix,
      contexts: ['all']
    });
  }

  chrome.runtime.onMessage.addListener((message: { type: "selection", text: string }) => {
    if (message.type === "selection" && message.text) {
      const selection = extractSelection(message.text)

      if (selection.type !== "none") {
        const typeString = selection.type === 'address' ? "Address" : "Transaction"

        chrome.contextMenus.update(contextMenuPrefix, { visible: true, title: `Show ${typeString} on Blockscout` });
      } else {
        chrome.contextMenus.update(contextMenuPrefix, { visible: false });
      }
    }
  });

  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.parentMenuItemId !== contextMenuPrefix) {
      return
    }

    const selection = extractSelection(info.selectionText)
    const explorer = explorers.find((e) => e.id === info.menuItemId)

    if (!explorer || selection.type === 'none') {
      return
    }

    if (chrome.tabs && chrome.tabs.executeScript) {
      let url = explorer.url

      switch (selection.type) {
        case 'address':
          url += `/address/${selection.data}`
          break
        case 'txHash':
          url += `/tx/${selection.data}`
      }

      chrome.tabs.create({
        active: true,
        index: tab.index + 1,
        url: url
      })
    }
  });

  chrome.runtime.onMessage.addListener((message: { type: "selection", text: string }, sender, sendResponse) => {
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