import { useState, useEffect } from "react"
import { useStorage } from "@plasmohq/storage/hook"
import { Storage } from "@plasmohq/storage"
import Settings from "~settings"
import SettingsIcon from "data-base64:./../assets/settings-icon.svg"
import BlockscoutIcon from "data-base64:./../assets/blockscout.svg"
import "~style.css"

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

// Component that handles ethereum data display - only renders when we have a tab ID
function EthereumDataDisplay({ activeTabId }: { activeTabId: number }) {
  const storageKey = `ethereumData_tab${activeTabId}`
  
  const [ethereumData] = useStorage<EthereumData | null>({
    key: storageKey,
    instance: storage
  })

  return (
    <div className="space-y-4">
      <>
        {ethereumData?.url && <div className="text-sm text-gray-600">
            Found on: {new URL(ethereumData.url).hostname}
          </div>
        }
        
        {ethereumData?.addresses?.length > 0 && (
          <div>
            <h3 className="font-medium text-sm mb-2">Ethereum Addresses ({ethereumData.addresses.length})</h3>
          </div>
        )}

        {ethereumData?.transactions?.length > 0 && (
          <div>
            <h3 className="font-medium text-sm mb-2">Transaction Hashes ({ethereumData.transactions.length})</h3>
          </div>
        )} 

        {ethereumData?.addresses?.length === 0 && ethereumData?.transactions?.length === 0 && (
          <div className="text-center text-gray-500 py-4">
            No Ethereum addresses or transactions found on this page
          </div>
        )}
      </>
    </div>
  )
}

function IndexPopup() {
  const [showSettings, setShowSettings] = useState(false)
  const [activeTabId, setActiveTabId] = useState<number | null>(null)

  useEffect(() => {
    const getTabId = async () => {
      try {
        const [tab] = await chrome.tabs.query({
          active: true,
          currentWindow: true
        })
        console.log('Active tab ID:', tab.id)
        setActiveTabId(tab.id ?? null)
      } catch (error) {
        console.error('Failed to get active tab:', error)
      }
    }
    getTabId()
  }, [])

  return (
    <div className="flex flex-col w-96 h-64">
      <div className="flex flex-row justify-between">
        <div className="flex flex-row justify-start p-2">
          <img src={BlockscoutIcon} alt="Blockscout" />
        </div>
        <div className="flex flex-row justify-end p-2">
          <button onClick={() => setShowSettings(!showSettings)}>
            <img src={SettingsIcon} alt="Settings" />
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

export default IndexPopup
