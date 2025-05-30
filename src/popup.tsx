import { useState } from "react"
import Settings from "~settings"

import "~style.css"

function IndexPopup() {
  const [showSettings, setShowSettings] = useState(false)

  return (
    <div>
      <button onClick={() => setShowSettings(!showSettings)}>Settings</button>
      {showSettings && <Settings />}
    </div>
  )
}

export default IndexPopup
