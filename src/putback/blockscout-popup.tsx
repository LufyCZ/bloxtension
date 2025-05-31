import { createRoot } from "react-dom/client"

import BlockscoutPopupWrapper from "../components/BlockscoutPopup"

window.addEventListener("load", () => {
  // Create container for React component
  const container = document.createElement("div")
  container.id = "bloxtension-root"
  document.body.appendChild(container)

  // Initialize React root
  const root = createRoot(container)

  // Listen for messages from the background script
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "show-blockscout-popup" && message.address) {
      root.unmount()
      const newRoot = createRoot(container)
      newRoot.render(<BlockscoutPopupWrapper address={message.address} />)
    }
  })
})
