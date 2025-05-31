import {
  NotificationProvider,
  TransactionPopupProvider,
  useTransactionPopup
} from "@blockscout/app-sdk"
import React from "react"

const TransactionPopup = ({ address, chainId }: { address: string, chainId: string }) => {
  const { openPopup } = useTransactionPopup()

  React.useEffect(() => {
    console.log("Opening popup for address:", address)
    try {
      openPopup({
        chainId: chainId,
        address: address
      })
    } catch (error) {
      console.error("Error opening popup:", error)
    }

    // Cleanup function to handle unmounting
    return () => {
      console.log("Cleaning up popup for address:", address)
    }
  }, [address, openPopup])

  return null
}

const BlockscoutPopupWrapper = ({ address, chainId }: { address: string, chainId: string }) => {
  console.log("Rendering BlockscoutPopupWrapper with address:", address)

  return (
    <NotificationProvider>
      <TransactionPopupProvider>
        <TransactionPopup address={address} chainId={chainId} />
      </TransactionPopupProvider>
    </NotificationProvider>
  )
}

export default BlockscoutPopupWrapper
