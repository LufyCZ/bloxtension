import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

interface EthereumData {
  addresses: string[]
  transactions: string[]
  url: string
  timestamp: number
  tabId: number
}

console.log('in message script')

// Use storage.local instead of storage.sync to avoid quota limitations
const storage = new Storage({
  area: "local"
})

const handler: PlasmoMessaging.MessageHandler<EthereumData> = async (req, res) => {
  try {
    // Store the data for popup access using Plasmo storage
    const { tabId, ...data } = req.body
    await storage.set(`ethereumData_tab${tabId}`, data)
    console.log('ethereumData_tab', tabId)
    console.log('Ethereum data stored in background');
    res.send({ success: true });
  } catch (error) {
    console.error('Failed to store ethereum data:', error);
    res.send({ success: false, error: error.message });
  }
}

export default handler 