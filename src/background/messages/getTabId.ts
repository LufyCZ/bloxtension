import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  res.send({ message: req.sender?.tab?.id })
}

export default handler
