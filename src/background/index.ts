import { createLinkMenu } from "~lib/create-link-menu";

export { }

console.log('in background index')

chrome.runtime.onInstalled.addListener(() => {
  createLinkMenu(
    {
      explorers: [{
        name: "Ethereum",
        url: "https://eth.blockscout.com"
      }]
    }
  )
});


