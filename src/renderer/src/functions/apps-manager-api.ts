export const openApp = async (appName: string) => {
  try {
    const result: any = await window.electron.ipcRenderer.invoke('open-app', appName)
    if (result.success) {
      // Delay execution for 1.2 seconds to allow the external application window to fully mount and gain active focus
      await new Promise((resolve) => setTimeout(resolve, 1200))
      return `Success: ${appName} is opening and focused.`
    }
    return `Error: ${result.error}`
  } catch (err) {
    return `System Error: ${err}`
  }
}

export const performWebSearch = async (query: string) => {
  await window.electron.ipcRenderer.invoke('google-search', query)
  return `Opening Google Search for: ${query}`
}

export const closeApp = async (appName: string) => {
  try {
    const result: any = await window.electron.ipcRenderer.invoke('close-app', appName)
    if (result && result.success) return `✅ Terminated ${appName}.`
    return `⚠️ Failed to close ${appName}. It might not be running or the name is incorrect.`
  } catch (err) {
    return 'System Error: Termination failed.'
  }
}
