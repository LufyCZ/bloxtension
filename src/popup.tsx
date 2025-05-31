import { useState, useEffect } from "react"
import { useStorage } from "@plasmohq/storage/hook"
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

function IndexPopup() {
  const [showSettings, setShowSettings] = useState(false)
  const [ethereumData, loading] = useStorage<EthereumData | null>("ethereumData")

  const refreshData = async () => {
    try {
      // Request fresh data from current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, { action: "refreshEthereumData" }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('Message sending failed:', chrome.runtime.lastError)
          } else if (response) {
            console.log('Refresh response:', response)
          }
        })
      }
    } catch (error) {
      console.error('Failed to refresh data:', error)
    }
  }

  return (
    <div className="flex flex-col w-80 p-4">
      <div className="flex flex-row justify-between items-center mb-4">
        <div className="flex flex-row items-center">
          <img src={BlockscoutIcon} alt="Blockscout" className="w-6 h-6 mr-2" />
          <h1 className="text-lg font-semibold">Bloxtension</h1>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={refreshData}
            className="p-1 hover:bg-gray-100 rounded text-sm"
            title="Refresh data"
          >
            🔄
          </button>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <img src={SettingsIcon} alt="Settings" className="w-5 h-5" />
          </button>
        </div>
      </div>

      {showSettings && <Settings />}

      {!showSettings && (
        <div className="space-y-4">
          {loading ? (
            <div className="text-center text-gray-500">Loading...</div>
          ) : ethereumData ? (
            <>
              <div className="text-sm text-gray-600">
                Found on: {new URL(ethereumData.url).hostname}
              </div>
              
              {ethereumData.addresses.length > 0 && (
                <div>
                  <h3 className="font-medium text-sm mb-2">Ethereum Addresses ({ethereumData.addresses.length})</h3>
                </div>
              )}

              {ethereumData.transactions.length > 0 && (
                <div>
                  <h3 className="font-medium text-sm mb-2">Transaction Hashes ({ethereumData.transactions.length})</h3>
                </div>
              )} 

              {ethereumData.addresses.length === 0 && ethereumData.transactions.length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  No Ethereum addresses or transactions found on this page
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-gray-500 py-4">
              No data available. Visit a page with Ethereum addresses or transactions.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default IndexPopup
