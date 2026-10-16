const CONVERSATIONS_KEY = 'codemind.conversations.v1'
const SETTINGS_KEY = 'codemind.settings.v1'

export const defaultSettings = {
  appearance: 'dark',
  compactMode: false,
  showTimestamps: true,
  showLineNumbers: true,
  enterToSend: true,
  streamingAnimation: true,
  explainWhileCoding: false,
  explanationStyle: 'brief',
}

export function readStoredValue(key, fallback) {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch (error) {
    console.error(`Could not read CodeMind local setting "${key}".`, error)
    return fallback
  }
}

export function readConversations() {
  const conversations = readStoredValue(CONVERSATIONS_KEY, null)
  return Array.isArray(conversations)
    ? conversations.filter((conversation) => !conversation.id?.startsWith('sample-'))
    : []
}

export function readSettings() {
  return { ...defaultSettings, ...readStoredValue(SETTINGS_KEY, {}) }
}

export function storeConversations(conversations) {
  try {
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations))
    return true
  } catch (error) {
    console.error('Could not save CodeMind conversations to local storage.', error)
    return false
  }
}

export function storeSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
    return true
  } catch (error) {
    console.error('Could not save CodeMind settings to local storage.', error)
    return false
  }
}
