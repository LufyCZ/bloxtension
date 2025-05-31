import { Storage } from "@plasmohq/storage"
import { extractChainsByIds, getSelectedChains, SELECTED_CHAINS_KEY } from "../lib/chain-storage";
import { createLinkMenu, updateLinkMenus } from "../lib/create-link-menu";

const storage = new Storage()

chrome.runtime.onInstalled.addListener(() => {
  getSelectedChains().then(chains => {
    createLinkMenu({ explorers: chains })
  })
})


storage.watch({
  [SELECTED_CHAINS_KEY]: (c) => {
    const newChains = extractChainsByIds(c.newValue)
    updateLinkMenus({ explorers: newChains })
  }
})

