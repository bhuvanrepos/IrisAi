export const sendWhatsAppMessage = async (name: string, message: string, filePath?: string) => {
  try {

    if (filePath) {
      await window.electron.ipcRenderer.invoke('copy-file-to-clipboard', filePath)
    }

    await window.electron.ipcRenderer.invoke('open-app', 'whatsapp')

    const navActions = [
      { type: 'wait', ms: 3000 }, // Wait for WhatsApp window to fully mount and gain active focus
      { type: 'press', key: 'escape' }, // Escape to clear any open dialogues
      { type: 'wait', ms: 500 },
      { type: 'press', key: 'n', modifiers: ['control'] }, // Ctrl+N to start new chat / global contact search
      { type: 'wait', ms: 800 },
      { type: 'type', text: name }, // Type recipient's name
      { type: 'wait', ms: 2000 }, // Wait for contact search results to filter
      { type: 'press', key: 'enter' }, // Press Enter to open the chat window
      { type: 'wait', ms: 1000 }
    ]
    await window.electron.ipcRenderer.invoke('ghost-sequence', navActions)

    if (filePath) {
      await window.electron.ipcRenderer.invoke('ghost-sequence', [
        { type: 'press', key: 'v', modifiers: ['control'] },
        { type: 'wait', ms: 2500 },
        { type: 'type', text: message },
        { type: 'wait', ms: 500 },
        { type: 'press', key: 'enter' }
      ])
    } else {
      await window.electron.ipcRenderer.invoke('ghost-sequence', [
        { type: 'paste', text: message },
        { type: 'wait', ms: 800 },
        { type: 'press', key: 'enter' }
      ])
    }

    return `✅ Message sent to ${name}.`
  } catch (error) {
    return '❌ Failed to send.'
  }
}

export const scheduleWhatsAppMessage = async (
  name: string,
  message: string,
  delayMinutes: number,
  filePath?: string
) => {
  if (!delayMinutes || delayMinutes <= 0) {
    return await sendWhatsAppMessage(name, message, filePath)
  }

 

  setTimeout(
    () => {
      window.electron.ipcRenderer.invoke('ghost-sequence', [{ type: 'type', text: '' }])

      sendWhatsAppMessage(name, message, filePath)
    },
    delayMinutes * 60 * 1000
  )

  return `✅ Scheduled! I will send the message to ${name} in ${delayMinutes} minutes.`
}

