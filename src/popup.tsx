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
  const [ethereumData] = useStorage<EthereumData | null>("ethereumData")

  console.log('ethereumData', ethereumData)
  useEffect(() => {
    console.log('in useeffect')
    console.log(ethereumData)
  }, [ethereumData])

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
      )}
    </div>
  )
}

export default IndexPopup
