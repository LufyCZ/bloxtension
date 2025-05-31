import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { address, chainId } = req.body

  const message = await fetchTokenPrice(address, chainId)
  res.send({ message })
}

async function fetchTokenPrice(address: string, chainId: number) {
  const response = await fetch("https://api.1inch.dev/price/v1.1/1", {
    method: "POST",
    headers: {
      Authorization: "Bearer agpdhY9VpMPx2C3QMaaOGbwPi3ISShkT",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      tokens: [address],
      currency: "USD"
    })
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const data = await response.json()
  console.log("data", data)
  return data
}

export default handler
