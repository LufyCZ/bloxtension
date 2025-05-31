import BlockscoutIcon from "data-base64:./../assets/blockscout.svg"
import { SettingsIcon } from "lucide-react"
import { useEffect, useState } from "react"

import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"

import "~style.css"

import {
  QueryClient,
  QueryClientProvider,
  useQuery
} from "@tanstack/react-query"
import { CopyIcon, ExternalLink } from "lucide-react"

import {
  getAddressesMultichain,
  getTransactionsMultichain
} from "~lib/graphql/blockscout"
import { shortenAddress } from "~lib/shorten-address"
import Settings from "~settings"

interface EthereumData {
  addresses: string[]
  transactions: string[]
  url: string
  timestamp: number
}

// Create storage instance using local area
const storage = new Storage({
  area: "local"
})

function EthereumDataDisplay({ activeTabId }: { activeTabId: number }) {
  const storageKey = `ethereumData_tab${activeTabId}`
  // Use storage.local to match the background script
  const [ethereumData] = useStorage<EthereumData | null>({
    key: storageKey,
    instance: storage
  })

  console.log(storageKey, ethereumData)

  const { data } = useQuery({
    queryKey: [ethereumData?.addresses, ethereumData?.transactions],
    queryFn: async () => {
      const addressesP = getAddressesMultichain({
        addresses: ethereumData!.addresses
      })
      const transactionsP = getTransactionsMultichain({
        txHashes: ethereumData!.transactions
      })

      const [addresses, transactions] = await Promise.all([
        addressesP,
        transactionsP
      ])

      return { addresses, transactions }
    },
    select: (data) => {
      type Chain = { chain: (typeof data.addresses)[number]["chain"] }

      const accounts: ((typeof data.addresses)[number]["data"][number] &
        Chain)[] = []
      const transactions: ((typeof data.transactions)[number]["data"][number] &
        Chain)[] = []
      const contracts: typeof accounts = []

      for (const entry of data.addresses) {
        for (const address of entry.data) {
          if (address.smartContract) {
            contracts.push({
              ...address,
              chain: entry.chain
            })
          } else {
            accounts.push({
              ...address,
              chain: entry.chain
            })
          }
        }
      }

      for (const entry of data.transactions) {
        for (const transaction of entry.data) {
          transactions.push({ ...transaction, chain: entry.chain })
        }
      }

      return { accounts, transactions, contracts }
    },
    enabled: !!ethereumData
  })

  return (
    <div className="space-y-2 px-3 py-1">
      <>
        {ethereumData?.url && (
          <div className="text-sm text-gray-600">
            Found on: {new URL(ethereumData.url).hostname}
          </div>
        )}

        {data?.accounts.length > 0 && (
          <div>
            <h3 className="text-lg mb-2">Accounts</h3>
            <div className="mx-2 border rounded-xl border-gray-400 text-sm">
              {data.accounts.map((account) => (
                <div
                  key={(account.address as string) + account.chain.id}
                  className="px-2 py-1 gap-x-2 w-full flex items-center border-b last:!border-0 border-gray-400 justify-between">
                  <img
                    src={account.chain.logo}
                    alt={account.chain.name}
                    width={16}
                    height={16}
                  />
                  <div className="border-x border-gray-400 w-px h-4" />
                  <div className="flex items-center gap-x-2">
                    <span>{shortenAddress(account.address as string)}</span>
                    <CopyIcon
                      width={14}
                      height={14}
                      className="text-gray-400 cursor-pointer"
                      onClick={() => {
                        navigator.clipboard.writeText(account.address as string)
                      }}
                    />
                  </div>
                  <div className="border-x border-gray-400 w-px h-4" />
                  <span>
                    {(Number(account.fetchedCoinBalance) / 1e18).toFixed(3)} ETH
                  </span>
                  <div className="border-x border-gray-400 w-px h-4" />
                  <a href={`${account.chain.url}/address/${account.address}`}>
                    <ExternalLink
                      width={16}
                      height={16}
                      className="text-blue-500"
                    />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {data?.contracts.length > 0 && (
          <div>
            <h3 className="text-lg mb-2">Contracts</h3>
            <div className="mx-2 border rounded-xl border-gray-400 text-sm">
              {data.contracts.map((account) => (
                <div
                  key={(account.address as string) + account.chain.id}
                  className="px-2 py-1 gap-x-1 w-full flex justify-between items-center border-b last:!border-0 border-gray-400">
                  <img
                    src={account.chain.logo}
                    alt={account.chain.name}
                    width={16}
                    height={16}
                  />
                  <div className="border-x border-gray-400 w-px h-4" />
                  <div className="flex items-center gap-x-2">
                    <span>{shortenAddress(account.address as string)}</span>
                    <CopyIcon
                      width={14}
                      height={14}
                      className="text-gray-400 cursor-pointer"
                      onClick={() => {
                        navigator.clipboard.writeText(account.address as string)
                      }}
                    />
                  </div>
                  <div className="border-x border-gray-400 w-px h-4" />
                  <span>{account.smartContract.name || "Unknown"}</span>
                  <div className="border-x border-gray-400 w-px h-4" />
                  <a href={`${account.chain.url}/address/${account.address}`}>
                    <ExternalLink
                      width={16}
                      height={16}
                      className="text-blue-500"
                    />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {data?.transactions.length > 0 && (
          <div>
            <h3 className="text-lg mb-2">Transactions</h3>
            <div className="mx-2 border rounded-xl border-gray-400 text-sm">
              {data.transactions.map((transaction) => (
                <div
                  key={(transaction.hash as string) + transaction.chain.id}
                  className="px-2 py-1 gap-x-1 w-full flex justify-between items-center border-b last:!border-0 border-gray-400">
                  <img
                    src={transaction.chain.logo}
                    alt={transaction.chain.name}
                    width={16}
                    height={16}
                  />
                  <div className="border-x border-gray-400 w-px h-4" />
                  <div className="flex items-center gap-x-2">
                    <span>{shortenAddress(transaction.hash as string)}</span>
                    <CopyIcon
                      width={14}
                      height={14}
                      className="text-gray-400 cursor-pointer"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          transaction.hash as string
                        )
                      }}
                    />
                  </div>
                  <div className="border-x border-gray-400 w-px h-4" />
                  <span>{transaction.status}</span>
                  <div className="border-x border-gray-400 w-px h-4" />
                  <a href={`${transaction.chain.url}/tx/${transaction.hash}`}>
                    <ExternalLink
                      width={16}
                      height={16}
                      className="text-blue-500"
                    />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </>
    </div>
  )
}

function _IndexPopup() {
  const [showSettings, setShowSettings] = useState(false)
  const [activeTabId, setActiveTabId] = useState<number | null>(null)

  useEffect(() => {
    const getTabId = async () => {
      try {
        const [tab] = await chrome.tabs.query({
          active: true,
          currentWindow: true
        })
        console.log("Active tab ID:", tab.id)
        setActiveTabId(tab.id ?? null)
      } catch (error) {
        console.error("Failed to get active tab:", error)
      }
    }
    getTabId()
  }, [])

  console.log("TAB NOW", activeTabId)

  return (
    <div className="flex flex-col w-96 h-96 overflow-x-hidden">
      <div className="flex flex-row justify-between">
        <div className="flex flex-row justify-start p-2">
          <img src={BlockscoutIcon} alt="Blockscout" />
        </div>
        <div className="flex flex-row justify-end p-2">
          <button onClick={() => setShowSettings(!showSettings)}>
            <SettingsIcon width={27} height={27} />
          </button>
        </div>
      </div>

      {showSettings && <Settings />}

      {!showSettings && (
        <>
          {activeTabId ? (
            <EthereumDataDisplay activeTabId={activeTabId} />
          ) : (
            <div className="flex justify-center items-center flex-1">
              <div className="text-gray-500">Loading...</div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function IndexPopup() {
  const [client] = useState(new QueryClient())

  return (
    <QueryClientProvider client={client}>
      <_IndexPopup />
    </QueryClientProvider>
  )
}

export default IndexPopup
