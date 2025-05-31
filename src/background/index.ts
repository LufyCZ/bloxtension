import { Storage } from "@plasmohq/storage"

import { chains } from "~chains"
import { createLinkMenu, updateLinkMenus } from "~lib/create-link-menu"

const storage = new Storage()

function parseStorageChains(ids: string[]) {
  return ids.flatMap<{ id: string; name: string; url: string }>((id) => {
    const chain = chains[`${id}` as keyof typeof chains]
    if (!chain) return []

    const explorer =
      chain.explorers.find((e) => e.hostedBy === "blockscout") ||
      chain.explorers[0]

    return {
      id: id,
      name: chain.name,
      url: explorer.url
    }
  })
}

chrome.runtime.onInstalled.addListener(async () => {
  const DEFAULT_CHAIN_IDS = ["30", "63"]
  const savedChains = await storage.get<string[]>("selected-chains")
  const chains = parseStorageChains(
    savedChains?.length ? savedChains : DEFAULT_CHAIN_IDS
  )
  console.log(chains)
  createLinkMenu({ explorers: chains })
})

chrome.runtime.onInstalled.addListener(() => {
  storage.get<string[]>("selected-chains").then((chainIds) => {
    const chains = parseStorageChains(chainIds)
    console.log(chains)
    createLinkMenu({ explorers: chains })
  })
})

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "bloxtension-link-menu-popup" && tab?.id) {
    // Send message to content script to show popup
    chrome.tabs.sendMessage(tab.id, {
      type: "show-blockscout-popup",
      address: info.selectionText
    })
  }
})

storage.watch({
  "selected-chains": (c) => {
    const newChains = parseStorageChains(c.newValue)
    updateLinkMenus({ explorers: newChains })
  }
})

export {}
