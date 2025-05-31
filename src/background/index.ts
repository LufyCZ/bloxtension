import { createLinkMenu, updateLinkMenus } from "~lib/create-link-menu";
import { Storage } from "@plasmohq/storage"
import { chains } from "~chains";

const storage = new Storage()

function parseStorageChains(ids: string[]) {
  return ids.flatMap<{ id: string, name: string, url: string }>((id) => {
    const chain = chains[`${id}` as keyof typeof chains]
    if (!chain) return []

    const explorer = chain.explorers.find((e) => e.hostedBy === "blockscout") || chain.explorers[0]

    return {
      id: id,
      name: chain.name,
      url: explorer.url,
    }
  })
}

chrome.runtime.onInstalled.addListener(() => {
  storage.get<string[]>("selected-chains").then(chainIds => {
    const chains = parseStorageChains(chainIds)
    console.log(chains)
    createLinkMenu({ explorers: chains })
  })
});

storage.watch({
  "selected-chains": (c) => {
    const newChains = parseStorageChains(c.newValue)
    updateLinkMenus({ explorers: newChains })
  },
})

export { }
