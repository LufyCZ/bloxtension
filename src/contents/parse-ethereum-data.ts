import type { PlasmoCSConfig } from "plasmo"
import { sendToBackground } from "@plasmohq/messaging"

document.addEventListener("selectionchange", () => {
  const selectedText = window.getSelection()?.toString();
  chrome.runtime.sendMessage({ type: "selection", text: selectedText });
});

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: true,
  // Run at document end to avoid CSP issues
  run_at: "document_end"
}

console.log('Bloxtension content script running')

// Cache for performance - avoid re-scanning same content
let lastTextHash = '';
let cachedData: { addresses: string[], transactions: string[] } = { addresses: [], transactions: [] };

// Simple but effective hash function for strings
function hashString(str: string): string {
  let hash = 0;
  if (str.length === 0) return hash.toString();
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString();
}

// Helper: match Ethereum addresses and tx hashes
async function findEthereumData() {
  // Get text content from page
  const text = document.body.innerText;

  // Hash the full content to detect any changes
  const currentHash = hashString(text);
  if (currentHash === lastTextHash) {
    return cachedData; // Return cached result if content unchanged
  }
  console.log('Content updated / first time loaded, finding ethereum data.')

  // Word boundaries (\b) ensure we match complete addresses/hashes, not partial ones
  // Global flag (g) finds all matches in the text
  const addressRegex = /\b0x[a-fA-F0-9]{40}\b/g;
  const txRegex = /\b0x[a-fA-F0-9]{64}\b/g;

  const addressMatches = text.match(addressRegex) || [];
  const txMatches = text.match(txRegex) || [];

  // Remove duplicates - Array.from() is more compatible than spread operator
  const addresses = Array.from(new Set(addressMatches));
  const transactions = Array.from(new Set(txMatches));

  // Cache the results
  lastTextHash = currentHash;
  cachedData = { addresses, transactions };

  // Send data using Plasmo messaging (works in both Chrome and Firefox)
  const dataToSend = {
    addresses,
    transactions,
    url: window.location.href,
    timestamp: Date.now()
  };
  console.log('data to send')
  console.log(dataToSend)

  try {
    // Send data to background via Plasmo messaging for storage and real-time updates
    await sendToBackground({
      name: "ethereum-data-update",
      body: dataToSend
    });
    console.log('Ethereum data sent via Plasmo messaging');
  } catch (error) {
    console.error('Failed to send ethereum data:', error);
  }

  return cachedData;
}

// Run on initial load
if (document.readyState === 'loading') {
  // DOM not yet loaded, wait for it and then run the findEthereumData function
  document.addEventListener('DOMContentLoaded', findEthereumData);
} else {
  // DOM already loaded
  findEthereumData();
}

let changeTimeout
// Watch for dynamic content changes
const observer = new MutationObserver(() => {
  clearTimeout(changeTimeout)
  changeTimeout = setTimeout(() => {
    findEthereumData();
  }, 500); // wait 500ms after last change
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
  characterData: true
});
