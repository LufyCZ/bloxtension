import { useStorage } from "@plasmohq/storage/hook"
import { useEffect, useState } from "react"
import { chains } from "./chains"
import { ChevronRight, SearchIcon } from "lucide-react"
import { SELECTED_CHAINS_KEY } from "~lib/chain-storage"

function Settings() {
    // const [verified, setVerified] = useStorage<boolean>("verified", false)
    // const [balance, setBalance] = useStorage<boolean>("balance", false)
    // const [idk, setIdk] = useStorage<boolean>("idk", false)
    const [selectedChains, setSelectedChains] = useStorage<number[]>(SELECTED_CHAINS_KEY)

    const [search, setSearch] = useState("")
    const [showChains, setShowChains] = useState(true)
    // const [showDetailSettings, setShowDetailSettings] = useState(false)

    if (showChains && selectedChains) {
        return (
            <div className="flex flex-col gap-2 pl-4 overflow-x-hidden">
                {/* <div className="flex flex-row items-center gap-1">
                    <button className="flex flex-row items-center gap-1" onClick={() => setShowChains(false)}>
                        <ChevronRight className="rotate-180" width={16} height={16} />
                        <p className="text-base">Chains</p>
                    </button>
                </div> */}
                <div className="flex flex-row items-center h-6 gap-2 pt-4 mb-3">
                    <input
                        type={"text"}
                        placeholder=""
                        className="bg-[#2A2A2A] border border-white rounded-md p-2 focus:outline-none h-6 w-56"
                        onChange={(e) => {
                            setSearch(e.target.value)
                        }}
                    />
                    <SearchIcon width={16} height={16} />
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
                                <img src={chain.logo} alt={chain.name} className="w-4 h-4" />
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
    // }
    // if (showDetailSettings) {
    //     return (
    //         <div className="flex flex-col gap-2 pl-4">
    //             <div className="flex flex-row items-center gap-1">
    //                 <button className="flex flex-row items-center gap-1" onClick={() => setShowDetailSettings(false)}>
    //                     <ChevronRight className="rotate-180" width={16} height={16} />
    //                     <p className="text-base">Details to show</p>
    //                 </button>
    //             </div>
    //             <div className="flex flex-col gap-2">
    //                 <p>Accounts</p>
    //                 <div className="flex flex-row items-center gap-2 pl-4">
    //                     <input
    //                         type={"checkbox"}
    //                         checked={balance}
    //                         onChange={(e) => setBalance(e.target.checked)}
    //                     />
    //                     <p>Balance</p>
    //                 </div>
    //                 <p>Transactions</p>
    //                 <div className="flex flex-row items-center gap-2 pl-4">
    //                     <input
    //                         type={"checkbox"}
    //                         checked={idk}
    //                         onChange={(e) => setIdk(e.target.checked)}
    //                     />
    //                     <p>IDK</p>
    //                 </div>
    //                 <p>Contracts</p>
    //                 <div className="flex flex-row items-center gap-2 pl-4">
    //                     <input
    //                         type={"checkbox"}
    //                         checked={verified}
    //                         onChange={(e) => setVerified(e.target.checked)}
    //                     />
    //                     <p>Verified</p>
    //                 </div>
    //             </div>
    //         </div>
    //     )
    // }
    // return (
    //     <div className="flex flex-col w-64 p-4 text-base">
    //         <div className="flex flex-row items-center gap-2">
    //             <button className="flex flex-row items-center gap-1" onClick={() => setShowChains(true)}>
    //                 <ChevronRight width={16} height={16} />
    //                 <p>Set chains</p>
    //             </button>
    //         </div>
    //         <div className="flex flex-row items-center gap-2">
    //             <button className="flex flex-row items-center gap-1" onClick={() => setShowDetailSettings(true)}>
    //                 <ChevronRight width={16} height={16} />
    //                 <p>Set details to show</p>
    //             </button>
    //         </div>
    //     </div>
    // )
}

export default Settings