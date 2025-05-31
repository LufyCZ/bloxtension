import { Storage } from "@plasmohq/storage"
import { chains } from "../chains"

export const SELECTED_CHAINS_KEY = "selected-chains"

export function extractChainsByIds(ids: string[] | number[]) {
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
  console.log('ids', ids)
  const DEFAULT_CHAIN_IDS = [30, 63, 1, 42161, 8453, 10]
  await storage.set(SELECTED_CHAINS_KEY, ids?.length ? ids : DEFAULT_CHAIN_IDS)
  return extractChainsByIds(ids?.length ? ids : DEFAULT_CHAIN_IDS)
}