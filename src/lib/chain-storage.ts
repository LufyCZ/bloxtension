import { Storage } from "@plasmohq/storage"
import { chains } from "../chains"

export const SELECTED_CHAINS_KEY = "selected-chains"

export function extractChainsByIds(ids: string[]) {
  return ids.flatMap<{ id: string, name: string, url: string, logo: string }>((id) => {
    const chain = chains[`${id}` as keyof typeof chains]
    if (!chain) return []

    const explorer = chain.explorers.find((e) => e.hostedBy === "blockscout") || chain.explorers[0]

    return {
      id: id,
      name: chain.name,
      url: explorer.url,
      logo: chain.logo
    }
  })
}

export async function getSelectedChains() {
  const storage = new Storage()
  const ids = await storage.get<string[]>(SELECTED_CHAINS_KEY)

  if (!ids) return []

  return extractChainsByIds(ids)
}