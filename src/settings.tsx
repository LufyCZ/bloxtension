import { useStorage } from "@plasmohq/storage/hook"

function Settings() {
  const [isVerified, setIsVerified] = useStorage<boolean>("is-verified", false)

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: 16,
        width: 300,
      }}>
      <p>Is verified: {isVerified}</p>
      <input
        type={"checkbox"}
        checked={isVerified}
        onChange={(e) => setIsVerified(e.target.checked)}
      />
    </div>
  )
}

export default Settings