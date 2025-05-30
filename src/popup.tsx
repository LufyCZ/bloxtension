import { useState } from "react"
import Settings from "~settings"
import SettingsIcon from "data-base64:./../assets/settings-icon.svg"
import "~style.css"

function IndexPopup() {
  const [showSettings, setShowSettings] = useState(false)

  return (
    <div className="flex flex-col w-64">
      <div className="flex flex-row justify-end">
      <button onClick={() => setShowSettings(!showSettings)}>
        <img src={SettingsIcon} alt="Settings" />
      </button>
      </div>
      {showSettings && <Settings />}
    </div>
  )
}

export default IndexPopup
