import type { PlasmoCSConfig } from "plasmo"

import { sendToBackground } from "@plasmohq/messaging"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: true,
  run_at: "document_end"
}

// Create and style the tooltip element
const tooltip = document.createElement("div")
tooltip.style.cssText = `
  position: fixed;
  background: #2d3748;
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  z-index: 10000;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  max-width: 300px;
  word-break: break-all;
`
document.body.appendChild(tooltip)

// Cache for token prices
const priceCache: { [key: string]: { price: number; timestamp: number } } = {}
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds

// Function to check if text is an Ethereum address
function isEthereumAddress(text: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(text)
}

async function fetchTokenPrice(address: string): Promise<number | null> {
  const response = await sendToBackground({
    name: "get-token-price",
    body: {
      address,
      chainId: 1
    }
  })
  return Number(Object.values(response.message)[0]).toFixed(
    2
  ) as unknown as number
}

// Function to handle mouseover events
async function handleMouseOver(event: MouseEvent) {
  const target = event.target as HTMLElement
  const text = target.textContent || ""

  if (isEthereumAddress(text)) {
    // Show loading state
    tooltip.textContent = `Address: ${text}\nFetching price...`
    tooltip.style.opacity = "1"

    // Position tooltip near the cursor
    const rect = target.getBoundingClientRect()
    tooltip.style.left = `${rect.left + window.scrollX}px`
    tooltip.style.top = `${rect.bottom + window.scrollY + 5}px`

    // Fetch price
    console.log("Fetching price for address:", text)
    const price = await fetchTokenPrice(text)
    console.log("price pog:", price?.valueOf())

    // Update tooltip with price if available
    if (price !== null) {
      tooltip.textContent = `Address: ${text}\nPrice: $${price}`
    } else {
      tooltip.textContent = `Address: ${text} Price: N/A`
    }
  }
}

// Function to handle mouseout events
function handleMouseOut() {
  tooltip.style.opacity = "0"
}

// Add event listeners to the document
document.addEventListener("mouseover", handleMouseOver)
document.addEventListener("mouseout", handleMouseOut)

// Watch for dynamic content changes
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.type === "childList") {
      // New nodes were added, check them for Ethereum addresses
      mutation.addedNodes.forEach((node) => {
        if (node instanceof HTMLElement) {
          const textNodes = Array.from(node.childNodes).filter(
            (n) => n.nodeType === Node.TEXT_NODE
          )

          textNodes.forEach((textNode) => {
            const text = textNode.textContent || ""
            if (isEthereumAddress(text)) {
              // Wrap the address in a span for hover detection
              const span = document.createElement("span")
              span.textContent = text
              textNode.parentNode?.replaceChild(span, textNode)
            }
          })
        }
      })
    }
  }
})

observer.observe(document.body, {
  childList: true,
  subtree: true,
  characterData: true
})
