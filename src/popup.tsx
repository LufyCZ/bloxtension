import { useState, useEffect } from "react"
import { useStorage } from "@plasmohq/storage/hook"
import { Storage } from "@plasmohq/storage"
import Settings from "~settings"
import BlockscoutIcon from "data-base64:./../assets/blockscout.svg"
import { SettingsIcon } from "lucide-react"
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

function IndexPopup() {
  const [showSettings, setShowSettings] = useState(false)
  // Use storage.local to match the background script
  const [ethereumData] = useStorage<EthereumData | null>({
    key: "ethereumData",
    instance: storage
  })

  console.log('ethereumData', ethereumData)
  useEffect(() => {
    console.log('in useeffect')
    console.log(ethereumData)
  }, [ethereumData])

  return (
    <div className="flex flex-col h-64 w-96">
      <div className="flex flex-row justify-between mb-1 border-b border-gray-200">
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
        <div className="space-y-4">
          <>
            {ethereumData?.url && <div className="text-sm text-gray-600">
              Found on: {new URL(ethereumData.url).hostname}
            </div>
            }

            {ethereumData?.addresses?.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-medium">Ethereum Addresses ({ethereumData.addresses.length})</h3>
              </div>
            )}

            {ethereumData?.transactions?.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-medium">Transaction Hashes ({ethereumData.transactions.length})</h3>
              </div>
            )}

            {ethereumData?.addresses?.length === 0 && ethereumData?.transactions?.length === 0 && (
              <div className="py-4 text-center text-gray-500">
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
