function extractSelection(text: string) {
  const txHashM = text.match(/0x[a-fA-F0-9]{64}/)
  const addressM = text.match(/0x[a-fA-F0-9]{40}/)

  const txHash = txHashM ? txHashM[0] : null
  const address = addressM ? addressM[0] : null

  if (txHash) return { type: "txHash", data: txHash } as const
  if (address) return { type: "address", data: address } as const
  return { type: "none" } as const
}

function onSelectionListener(message: { type: "selection"; text: string }) {
  if (message.type === "selection" && message.text) {
    const selection = extractSelection(message.text)

    if (selection.type !== "none") {
      const typeString =
        selection.type === "address" ? "Address" : "Transaction"

      chrome.contextMenus.update(contextMenuPrefix, {
        visible: true,
        title: `Show ${typeString} on Blockscout`
      })
    } else {
      chrome.contextMenus.update(contextMenuPrefix, { visible: false })
    }
  }
}

let explorers:
  | { url: string; name: string; id: string; menuId: string }[]
  | undefined

function onContextMenuClickListener(
  info: chrome.contextMenus.OnClickData,
  tab?: chrome.tabs.Tab
) {
  if (info.parentMenuItemId !== contextMenuPrefix) {
    return
  }

  if (!explorers) {
    return
  }

  const selection = extractSelection(info.selectionText || "")
  const explorer = explorers.find((e) => e.menuId === info.menuItemId)

  if (!explorer || selection.type === "none") {
    return
  }

  if (chrome.tabs) {
    let url = explorer.url

    switch (selection.type) {
      case "address":
        url += `/address/${selection.data}`
        break
      case "txHash":
        url += `/tx/${selection.data}`
    }

    chrome.tabs.create({
      active: true,
      index: tab ? tab.index + 1 : undefined,
      url: url
    })
  }
}

function createMenuId(chainName: string) {
  return `${contextMenuPrefix}-${chainName.replaceAll(" ", "-")}`
}

interface CreateLinkMenu {
  explorers: {
    id: string
    name: string
    url: string
  }[]
}

const contextMenuPrefix = "bloxtension-link-menu"

export function createLinkMenu({ explorers: _explorers }: CreateLinkMenu) {
  chrome.contextMenus.create({
    id: contextMenuPrefix,
    visible: false,
    title: "Blockscout",
    contexts: ["selection"]
  })

  chrome.contextMenus.create({
    id: `${contextMenuPrefix}-popup`,
    title: "Show Transaction History Popup",
    contexts: ["selection"]
  })

  explorers = _explorers.map((explorer) => ({
    ...explorer,
    menuId: createMenuId(explorer.name)
  }))

  for (const explorer of explorers) {
    chrome.contextMenus.create({
      id: explorer.menuId,
      title: `On ${explorer.name}`,
      parentId: contextMenuPrefix,
      contexts: ["all"]
    })
  }

  chrome.runtime.onMessage.addListener(onSelectionListener)
  chrome.contextMenus.onClicked.addListener(onContextMenuClickListener)
}

export function updateLinkMenus({ explorers: newExplorers }: CreateLinkMenu) {
  const previousExplorers = explorers

  if (!previousExplorers) {
    createLinkMenu({ explorers: newExplorers })
    return
  }

  const removedExplorers = previousExplorers.filter(
    (prevExplorer) =>
      !newExplorers.find((newExplorer) => newExplorer.id === prevExplorer.id)
  )

  for (const removedExplorer of removedExplorers) {
    chrome.contextMenus.remove(removedExplorer.menuId)
  }

  const addedExplorers = newExplorers.filter(
    (newExplorer) =>
      !previousExplorers.find(
        (prevExplorer) => prevExplorer.id === newExplorer.id
      )
  )

  for (const addedExplorer of addedExplorers) {
    chrome.contextMenus.create({
      id: createMenuId(addedExplorer.name),
      title: `On ${addedExplorer.name}`,
      parentId: contextMenuPrefix,
      contexts: ["all"]
    })
  }

  explorers = newExplorers.map((explorer) => ({
    ...explorer,
    menuId: createMenuId(explorer.name)
  }))
}
