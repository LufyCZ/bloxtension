import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { address } = req.body

  try {
    const response = await fetch(
      `https://api.1inch.dev/token/v1.2/1/custom/${address}`,
      {
        headers: {
          Authorization: "Bearer agpdhY9VpMPx2C3QMaaOGbwPi3ISShkT"
        }
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    res.send({ message: data })
  } catch (error) {
    console.error("Error fetching token info:", error)
    res.send({ error: error.message })
  }
}

export default handler
