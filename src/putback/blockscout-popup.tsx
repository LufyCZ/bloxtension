import { createRoot } from "react-dom/client"

import BlockscoutPopupWrapper from "../components/BlockscoutPopup"

window.addEventListener("load", () => {
  console.log(
    "You may find that having is not so pleasing a thing as wanting. This is not logical, but it is often true."
  )

  // Create container for React component
  const container = document.createElement("div")
  container.id = "bloxtension-root"
  document.body.appendChild(container)

  // Initialize React root
  const root = createRoot(container)

  // Function to check if a string is a valid Ethereum address
  const isEthereumAddress = (text: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(text)
  }

  let currentAddress: string | null = null
  let unmountTimeout: NodeJS.Timeout | null = null

  // Add mouseover event listener to the entire document
  /*
  document.addEventListener("mouseover", (event) => {
    const target = event.target as HTMLElement
    const text = target.textContent || ""
    const trimmedText = text.trim()

    if (isEthereumAddress(trimmedText)) {
      console.log("Ethereum address detected:", trimmedText)

      // Clear any pending unmount
      if (unmountTimeout) {
        clearTimeout(unmountTimeout)
        unmountTimeout = null
      }

      if (currentAddress !== trimmedText) {
        currentAddress = trimmedText
        console.log("Rendering Blockscout popup")
        root.render(<BlockscoutPopupWrapper address={trimmedText} />)
      }
    }
  })

  // Add mouseout event listener to hide the popup
  document.addEventListener("mouseout", (event) => {
    const target = event.target as HTMLElement
    const text = target.textContent || ""
    const trimmedText = text.trim()

    if (isEthereumAddress(trimmedText)) {
      // Add a small delay before unmounting to prevent flickering
      unmountTimeout = setTimeout(() => {
        console.log("Unmounting Blockscout popup")
        root.render(null)
        currentAddress = null
      }, 300)
    }
  })
  */
})
