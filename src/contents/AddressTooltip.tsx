import type { PlasmoCSConfig } from "plasmo"
import React, { useEffect, useState } from "react"
import { createRoot } from "react-dom/client"

import { sendToBackground } from "@plasmohq/messaging"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: true,
  run_at: "document_end"
}

interface TokenInfo {
  symbol: string
  logoURI: string
}

interface TooltipProps {
  address: string
  position: { x: number; y: number }
  onClose: () => void
}

export const AddressTooltip: React.FC<TooltipProps> = ({
  address,
  position,
  onClose
}) => {
  const [price, setPrice] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null)

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await sendToBackground({
          name: "get-token-price",
          body: {
            address,
            chainId: 1
          }
        })
        const priceValue = Number(Object.values(response.message)[0]).toFixed(2)
        setPrice(Number(priceValue))
      } catch (error) {
        console.error("Error fetching price:", error)
      } finally {
        setLoading(false)
      }
    }
    const fetchTokenInfo = async () => {
      try {
        const response = await sendToBackground({
          name: "get-token-info",
          body: { address }
        })
        setTokenInfo(response.message)
      } catch (error) {
        console.error("Error fetching token info:", error)
      }
    }

    fetchPrice()
    fetchTokenInfo()
  }, [address])

  return (
    <div
      style={{
        position: "fixed",
        left: `${position?.x ?? 0}px`,
        top: `${position?.y ?? 0}px`,
        background: "#2d3748",
        color: "white",
        padding: "8px 12px",
        borderRadius: "4px",
        fontSize: "14px",
        zIndex: 10000,
        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
        maxWidth: "300px",
        wordBreak: "break-all",
        transform: "translate(-50%, 0)",
        pointerEvents: "none"
      }}>
      <div className="flex items-center gap-2">
        {tokenInfo?.logoURI && (
          <img
            src={tokenInfo.logoURI}
            alt={tokenInfo.symbol}
            width={16}
            height={16}
            className="w-6 h-6 rounded-full"
          />
        )}
        {tokenInfo?.symbol && ( 
          <>
            <span style={{ marginLeft: "4px", marginTop: "2px" }} className="font-medium">{tokenInfo.symbol}</span>
            <br />
          </>
        )}
        <span className="text-gray-300">
          Price: {loading ? "Loading..." : price ? `$${price}` : "N/A"}
        </span>
      </div>
    </div>
  )
}

// Create tooltip container and initialize React root
let root: ReturnType<typeof createRoot> | null = null
let tooltipContainer: HTMLElement | null = null
let observer: MutationObserver | null = null
let currentHoveredElement: HTMLElement | null = null
let currentAddress: string | null = null

// Function to check if text is an Ethereum address
function isEthereumAddress(text: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(text)
}

// Function to calculate position from element
function calculatePosition(element: HTMLElement) {
  const rect = element.getBoundingClientRect()
  return {
    x: rect.left + rect.width / 2,
    y: rect.bottom + 5
  }
}

// Function to update tooltip position
function updateTooltipPosition() {
  if (!root || !currentHoveredElement || !currentAddress) return
  
  const position = calculatePosition(currentHoveredElement)
  root.render(
    <AddressTooltip
      address={currentAddress}
      position={position}
      onClose={() => {
        root?.render(null)
        currentHoveredElement = null
        currentAddress = null
      }}
    />
  )
}

// Function to handle mouseover events
function handleMouseOver(event: MouseEvent) {
  if (!root) return

  const target = event.target as HTMLElement
  const text = target.textContent || ""

  if (isEthereumAddress(text)) {
    currentHoveredElement = target
    currentAddress = text
    updateTooltipPosition()
  }
}

// Function to handle mouseout events
function handleMouseOut() {
  if (root) {
    root.render(null)
    currentHoveredElement = null
    currentAddress = null
  }
}

// Function to handle scroll events
function handleScroll() {
  if (currentHoveredElement && currentAddress) {
    updateTooltipPosition()
  }
}

// Clean up function
function cleanup() {
  document.removeEventListener("mouseover", handleMouseOver)
  document.removeEventListener("mouseout", handleMouseOut)
  document.removeEventListener("scroll", handleScroll, true)
  if (observer) {
    observer.disconnect()
  }
  if (root) {
    root.unmount()
  }
  if (tooltipContainer) {
    tooltipContainer.remove()
  }
}

// Main initialization function
export default function initializeAddressTooltip() {
  try {
    // Create tooltip container and initialize React root
    tooltipContainer = document.createElement("div")
    tooltipContainer.id = "react-address-tooltip-container"
    tooltipContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 10000;
    `
    document.body.appendChild(tooltipContainer)
    root = createRoot(tooltipContainer)
  } catch (error) {
    console.error("Failed to initialize tooltip container:", error)
    return
  }

  // Add event listeners to the document
  document.addEventListener("mouseover", handleMouseOver)
  document.addEventListener("mouseout", handleMouseOut)
  document.addEventListener("scroll", handleScroll, true)

  // Watch for dynamic content changes
  observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            const textNodes = Array.from(node.childNodes).filter(
              (n) => n.nodeType === Node.TEXT_NODE
            )

            textNodes.forEach((textNode) => {
              const text = textNode.textContent || ""
              if (isEthereumAddress(text)) {
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

  // Clean up when the page is unloaded
  window.addEventListener("unload", cleanup)
}
