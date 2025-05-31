export function shortenAddress(hex: string) {
  return `${hex.substring(0, 8)}...${hex.substring(hex.length - 6)}`
}