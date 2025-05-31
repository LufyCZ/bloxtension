import { extractSelection } from "~utils"

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
      if (selection.type === "address") {
        chrome.contextMenus.update(`${contextMenuPrefix}-popup`, { visible: true })
      }
    } else {
      chrome.contextMenus.update(contextMenuPrefix, { visible: false })
      chrome.contextMenus.update(`${contextMenuPrefix}-popup`, { visible: false })
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
  if (info.parentMenuItemId !== contextMenuPrefix && info.parentMenuItemId !== `${contextMenuPrefix}-popup`) {
    return
  }

  if (!explorers) {
    return
  }

  const selection = extractSelection(info.selectionText || "")
  const explorer = explorers.find((e) => e.menuId === info.menuItemId || `${e.menuId}-popup` === info.menuItemId)

  if (!explorer || selection.type === "none") {
    return
  }

  if (info.menuItemId === `${explorer.menuId}-popup`) {
    chrome.tabs.sendMessage(tab.id, {
      type: "show-blockscout-popup",
      address: selection.data,
      chainId: explorer.id
    })
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
    visible: false,
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
      title: `${explorer.name}`,
      parentId: contextMenuPrefix,
      contexts: ["all"]
    })
    chrome.contextMenus.create({
      id: `${explorer.menuId}-popup`,
      title: `${explorer.name}`,
      parentId: `${contextMenuPrefix}-popup`,
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
    chrome.contextMenus.create({
      id: `${createMenuId(addedExplorer.name)}-popup`,
      title: `${addedExplorer.name}`,
      parentId: `${contextMenuPrefix}-popup`,
      contexts: ["all"]
    })
  }

  explorers = newExplorers.map((explorer) => ({
    ...explorer,
    menuId: createMenuId(explorer.name)
  }))
}
