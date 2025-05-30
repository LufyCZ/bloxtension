import { useStorage } from "@plasmohq/storage/hook"

function Settings() {
    const [isVerified, setIsVerified] = useStorage<boolean>("is-verified", false)

    return (
        <div
            className="flex flex-col p-4 w-64">
            <div className="flex flex-row gap-2">
                <p>Is verified:</p>
                <input
                    type={"checkbox"}
                    checked={isVerified}
                    onChange={(e) => setIsVerified(e.target.checked)}
                />
            </div>
            <div className="flex flex-row gap-2">
                <p>Is verified:</p>
                <input
                    type={"checkbox"}
                    checked={isVerified}
                    onChange={(e) => setIsVerified(e.target.checked)}
                />
            </div>
        </div>
    )
}

export default Settings