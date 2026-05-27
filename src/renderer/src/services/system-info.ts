export interface SystemStats {
  cpu: string
  memory: {
    total: string
    free: string
    usedPercentage: string
  }
  temperature: number
  os: {
    type: string
    uptime: string
  }
}

export interface AppItem {
  name: string
  id: string
}

export const getSystemStatus = async (): Promise<SystemStats | null> => {
  try {
    if (window.electron?.ipcRenderer) {
      return await window.electron.ipcRenderer.invoke('get-system-stats')
    }
  } catch (error) {
    // fall through
  }

  // Browser fallback mock stats
  const mockCpu = (Math.random() * 15 + 10).toFixed(1)
  const mockUsedRam = (Math.random() * 5 + 42).toFixed(1)
  const mockTemp = Math.floor(Math.random() * 8 + 41)
  return {
    cpu: mockCpu,
    memory: {
      total: '16.00 GB',
      free: '9.28 GB',
      usedPercentage: mockUsedRam
    },
    temperature: mockTemp,
    os: {
      type: 'Windows 11 Web Sandbox',
      uptime: '2h 15m'
    }
  }
}

export const getAllApps = async (): Promise<AppItem[]> => {
  try {
    if (window.electron?.ipcRenderer) {
      const apps = await window.electron.ipcRenderer.invoke('get-installed-apps')
      return Array.isArray(apps) ? apps : []
    }
  } catch (error) {
    // fall through
  }
  return [
    { name: 'Google Chrome', id: 'chrome' },
    { name: 'VS Code', id: 'vscode' },
    { name: 'Spotify', id: 'spotify' },
    { name: 'WhatsApp', id: 'whatsapp' }
  ]
}

export const getDrives = async (): Promise<any[]> => {
  try {
    if (window.electron?.ipcRenderer) {
      return await window.electron.ipcRenderer.invoke('get-drives')
    }
  } catch (error) {
    // fall through
  }
  return [{ mounted: 'C:', filesystem: 'NTFS', size: 1000240960000, used: 450920480000 }]
}
