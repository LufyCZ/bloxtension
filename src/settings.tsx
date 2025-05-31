import { useStorage } from "@plasmohq/storage/hook"
import { useState } from "react"
import chains from "./chains.json"
import ArrowIcon from "data-base64:./../assets/arrow.svg"
import SearchIcon from "data-base64:./../assets/search.svg"

function Settings() {
    const [isVerified, setIsVerified] = useStorage<boolean>("is-verified", false)
    const [selectedChains, setSelectedChains] = useStorage<number[]>("selected-chains", [])

    const [search, setSearch] = useState("")
    const [showChains, setShowChains] = useState(false)
    const [showDetailSettings, setShowDetailSettings] = useState(false)

    if (showChains) {
                                                                                                                                                                                                                                                                                                                return (
            <div className="flex flex-col gap-2 pl-4 overflow-x-hidden">
                <button className="flex justify-end text-sm pr-2" onClick={() => setShowChains(false)}>back</button>
                <div className="flex flex-row gap-2">
                    <h3 className="text-lg">Chains</h3>
                </div>
                <div className="flex flex-row gap-2 h-6 items-center mb-3">
                    <input
                        type={"text"}
                        placeholder=""
                        className="bg-[#2A2A2A] border border-white rounded-md p-2 focus:outline-none h-6 w-56"
                        onChange={(e) => {
                            setSearch(e.target.value)
                        }}
                    />
                    <img src={SearchIcon} alt="search" className="h-4 w-4" />
                </div>
                <div className="flex flex-col gap-2">
                    {Object.entries(chains)
                        .filter(([_, chain]) => chain.name.toLowerCase().includes(search.toLowerCase()))
                        .sort(([aId, _a], [bId, _b]) => {
                            const aSelected = selectedChains.includes(Number(aId))
                            const bSelected = selectedChains.includes(Number(bId))
                            if (aSelected === bSelected) return 0
                            return aSelected ? -1 : 1
                        })
                        .map(([chainId, chain]) => (
                            <div className="flex flex-row gap-2" key={chainId}>
                                <p>{chain.name}</p>
                                <input
                                    type={"checkbox"}
                                    checked={selectedChains.includes(Number(chainId))}
                                    onChange={(e) => {
                                        const id = Number(chainId)
                                        if (e.target.checked) {
                                            setSelectedChains([...selectedChains, id])
                                        } else {
                                            setSelectedChains(selectedChains.filter((c) => c !== id))
                                        }
                                    }}
                                />
                            </div>
                        ))}
                </div>
            </div>
        )
    }
    if (showDetailSettings) {
        return (
            <div className="flex flex-col gap-2 pl-4">
                <button className="flex justify-end text-sm pr-2" onClick={() => setShowDetailSettings(false)}>back</button>
                <div className="flex flex-row gap-2">
                    <p className="text-base">Is verified:</p>
                    <input
                        type={"checkbox"}
                        checked={isVerified}
                        onChange={(e) => setIsVerified(e.target.checked)}
                    />
                </div>
            </div>
        )
    }
    return (
        <div
            className="flex flex-col p-4 w-64 text-base">
            <div className="flex flex-row gap-2">
                <img src={ArrowIcon} alt="arrow" />
                <button onClick={() => setShowChains(true)}>Set chains</button>
            </div>
            <div className="flex flex-row gap-2">
                <img src={ArrowIcon} alt="arrow" />
                <button onClick={() => setShowDetailSettings(true)}>Set details to show</button>
            </div>
        </div>
    )
}

export default Settings