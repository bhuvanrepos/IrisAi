const setVolume = async (level: number) => {
  try {
    return await window.electron.ipcRenderer.invoke('set-volume', level)
  } catch (error) {
    return '❌ Failed to set volume.'
  }
}

const takeScreenshot = async () => {
  try {
    return await window.electron.ipcRenderer.invoke('take-screenshot')
  } catch (error) {
    return '❌ Failed to capture screen.'
  }
}

const getScreenSize = async () => {
  return await window.electron.ipcRenderer.invoke('get-screen-size')
}

const clickOnCoordinate = async (x: number, y: number) => {
  await window.electron.ipcRenderer.invoke('ghost-click-coordinate', { x, y })
  await new Promise((resolve) => setTimeout(resolve, 300))
  return `Clicked on (${x}, ${y})`
}

const scrollScreen = async (direction: 'up' | 'down', amount: number) => {
  await window.electron.ipcRenderer.invoke('ghost-scroll', { direction, amount })
  await new Promise((resolve) => setTimeout(resolve, 200))
  return `Scrolled ${direction}.`
}

const pressShortcut = async (key: string, modifiers: string[]) => {
  await window.electron.ipcRenderer.invoke('ghost-sequence', [{ type: 'press', key, modifiers }])
  await new Promise((resolve) => setTimeout(resolve, 200))
  return `Pressed ${modifiers.join('+')}+${key}`
}

export { setVolume, takeScreenshot, getScreenSize, clickOnCoordinate, scrollScreen, pressShortcut }