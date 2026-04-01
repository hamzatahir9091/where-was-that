// chrome.commands.onCommand.addListener((command) => {
//   chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//     if (!tabs[0]?.id) return

//     chrome.tabs.sendMessage(tabs[0].id, { action: command })
//   })
// })

chrome.commands.onCommand.addListener((command) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0]?.id
    if (!tabId) return
    try {
      chrome.scripting.executeScript(
        {
          target: { tabId },
          func: (cmd) => {
            // trigger the corresponding function in the page
            if (cmd === "add-pin") window.addPin?.()
            if (cmd === "open-pins") window.loadPins?.()
            if (cmd === "clear-pins") window.MARKERS && window.showDialogue && (() => {
              const url = window.location.href
              window.MARKERS.delete(url)
              chrome.storage.local.remove(url)
              document.getElementById("savedPins")?.remove()
              window.showDialogue("del")
            })()
          },
          args: [command],
        },
        () => {
          if (chrome.runtime.lastError) {
            console.warn("Command not delivered:", chrome.runtime.lastError.message)
          }
        }
      )
    } catch (e) {
      console.error("Command execution error:", e)
    }
  })
})