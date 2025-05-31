import { useState } from "react"
import Settings from "~settings"
import SettingsIcon from "data-base64:./../assets/settings-icon.svg"
import BlockscoutIcon from "data-base64:./../assets/blockscout.svg"
import "~style.css"

function IndexPopup() {
  const [showSettings, setShowSettings] = useState(false)

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
    </div>
  )
}

export default IndexPopup
