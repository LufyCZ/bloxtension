import { createLinkMenu } from "~lib/create-link-menu";

export { }

chrome.runtime.onInstalled.addListener(() => {
  createLinkMenu(
    {
      explorers: [{
        name: "Ethereum",
        url: "https://eth.blockscout.com/"
      }]
    }
  )
});

