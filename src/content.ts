export { }

document.addEventListener("selectionchange", () => {
  const selectedText = window.getSelection()?.toString();
  chrome.runtime.sendMessage({ type: "selection", text: selectedText });
});