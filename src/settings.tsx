import { useStorage } from "@plasmohq/storage/hook"
import { useState } from "react"
import chains from "./chains.json"


function Settings() {
    const [isVerified, setIsVerified] = useStorage<boolean>("is-verified", false)
    const [selectedChains, setSelectedChains] = useStorage<string[]>("selected-chains", [])
    const [search, setSearch] = useState("")
    const [showChains, setShowChains] = useState(false)

    if (showChains) {
        return (
            <div className="flex flex-col gap-2">
                <button className="flex justify-end" onClick={() => setShowChains(false)}>back</button>
                <div className="flex flex-row gap-2">
                    <h3 className="text-lg font-bold">Chains</h3>
                </div>
                <div className="flex flex-row gap-2">
                    <input
                        type={"text"}
                        placeholder="Search"
                        className="bg-black text-white"
                        onChange={(e) => {
                            setSearch(e.target.value)
                        }}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    {Object.values(chains)
                        .filter((chain) => chain.name.toLowerCase().includes(search.toLowerCase()))
                        .sort((a, b) => {
                            const aSelected = selectedChains.includes(a.name)
                            const bSelected = selectedChains.includes(b.name)
                            if (aSelected === bSelected) return 0
                            return aSelected ? -1 : 1
                        })
                        .map((chain) => (
                            <div className="flex flex-row gap-2">
                                <p>{chain.name}</p>
                                <input
                                    type={"checkbox"}
                                    checked={selectedChains.includes(chain.name)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedChains([...selectedChains, chain.name])
                                        } else {
                                            setSelectedChains(selectedChains.filter((c) => c !== chain.name))
                                        }
                                    }}
                                />
                            </div>
                        ))}
                </div>
            </div>
        )
    }
    return (
        <div
            className="flex flex-col p-4 w-64">
            <div className="flex flex-row gap-2">
                <button onClick={() => setShowChains(true)}>Set chains</button>
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