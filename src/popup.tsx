import { useState } from "react"
import Settings from "~settings"

import "~style.css"

function IndexPopup() {
  const [showSettings, setShowSettings] = useState(false)

  return (
    <div className="flex flex-col w-64">
      <button onClick={() => setShowSettings(!showSettings)}>{showSettings ? "Hide Settings" : "Show Settings"}</button>
      {showSettings && <Settings />}
    </div>
  )
}

export default IndexPopup
