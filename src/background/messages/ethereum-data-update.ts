import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

interface EthereumData {
  addresses: string[]
  transactions: string[]
  url: string
  timestamp: number
}

console.log('in message script')

const storage = new Storage()

const handler: PlasmoMessaging.MessageHandler<EthereumData> = async (req, res) => {
  try {
    // Store the data for popup access using Plasmo storage
    await storage.set("ethereumData", req.body)
    console.log('Ethereum data stored in background');
    res.send({ success: true });
  } catch (error) {
    console.error('Failed to store ethereum data:', error);
    res.send({ success: false, error: error.message });
  }
}

export default handler 