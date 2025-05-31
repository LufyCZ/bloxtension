export function extractSelection(text: string) {
    const txHashM = text.match(/0x[a-fA-F0-9]{64}/)
    const addressM = text.match(/0x[a-fA-F0-9]{40}/)

    const txHash = txHashM ? txHashM[0] : null
    const address = addressM ? addressM[0] : null

    if (txHash) return { type: "txHash", data: txHash } as const
    if (address) return { type: "address", data: address } as const
    return { type: "none" } as const
}