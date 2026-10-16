import { createMockResponse } from './data/mockResponses.js'
import { readConversations, readSettings, storeConversations, storeSettings } from './utils/storage.js'

const root = document.querySelector('#app')
const createId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
const timestamp = () => new Date().toISOString()
const wait = (duration) => new Promise((resolve) => window.setTimeout(resolve, duration))
const state = {
  conversations: readConversations(),
  settings: readSettings(),
  activeId: null,
  collapsed: false,
  mobileOpen: false,
  settingsOpen: false,
  helpOpen: false,
  busyIds: new Set(),
  search: '',
  menuId: null,
  headerMenuOpen: false,
  userMenuOpen: false,
  toolsOpen: false,
  draft: '',
  view: 'chat',
  tokenizerText: '',
  tokenizerResult: null,
  tokenizerError: '',
  tokenizerRunning: false,
  tokenizerRuntimePromise: null,
  attachments: [],
  copied: '',
}

const icons = {
  arrowUp: '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
  arrowUpRight: '<path d="M7 17 17 7"/><path d="M7 7h10v10"/>',
  bot: '<rect x="3" y="8" width="18" height="13" rx="2"/><path d="M12 8V4H8"/><path d="M8 13h.01M16 13h.01M8 17h8"/>',
  braces: '<path d="M8 3H6a2 2 0 0 0-2 2v3a2 2 0 0 1-2 2 2 2 0 0 1 2 2v3a2 2 0 0 0 2 2h2M16 3h2a2 2 0 0 1 2 2v3a2 2 0 0 0 2 2 2 2 0 0 0-2 2v3a2 2 0 0 1-2 2h-2"/>',
  bug: '<rect x="8" y="6" width="8" height="14" rx="4"/><path d="M19 12h-3M8 12H5m11.5-5.5 2-2M5.5 4.5l2 2M19 20l-3-3M5 20l3-3M12 6V3"/>',
  check: '<path d="m20 6-11 11-5-5"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  chevronsLeft: '<path d="m11 17-5-5 5-5M18 17l-5-5 5-5"/>',
  code: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/><line x1="14" x2="10" y1="4" y2="20"/>',
  copy: '<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
  fileCode: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M10 13l-2 2 2 2m4-4 2 2-2 2"/>',
  filePlus: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6m-8 4v6m-3-3h6"/>',
  help: '<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3m.1 4h.01"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  message: '<path d="M21 15a4 4 0 0 1-4 4H7l-4 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/>',
  messagePlus: '<path d="M21 15a4 4 0 0 1-4 4H7l-4 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/><path d="M12 8v6m-3-3h6"/>',
  monitor: '<rect x="3" y="3" width="18" height="13" rx="2"/><path d="M8 21h8m-4-5v5"/>',
  moon: '<path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z"/>',
  more: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  paperclip: '<path d="m21.4 11.1-8.5 8.5a6 6 0 0 1-8.5-8.5l9.2-9.2a4 4 0 0 1 5.7 5.7l-9.2 9.2a2 2 0 0 1-2.8-2.8l8.5-8.5"/>',
  pencil: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/>',
  plus: '<path d="M12 5v14m-7-7h14"/>',
  rotate: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5m4-1v5l3 2"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  settings: '<path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"/><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.6a8 8 0 0 1-1.7 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.7-1l-1.7.6-1.4-2.4 1.4-1.1a8 8 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.6a8 8 0 0 1 1.7-1l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.7 1l1.7-.6 1.4 2.4-1.4 1.1a8 8 0 0 1 0 2Z"/>',
  sparkles: '<path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Zm7 12 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15ZM5 3l.8 2.2L8 6l-2.2.8L5 9l-.8-2.2L2 6l2.2-.8L5 3Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2m10-10h-2M4 12H2m17.1 7.1-1.4-1.4M6.3 6.3 4.9 4.9m14.2 0-1.4 1.4M6.3 17.7l-1.4 1.4"/>',
  trash: '<path d="M3 6h18m-2 0-.9 14H5.9L5 6m4 0V4h6v2m-5 4v6m4-6v6"/>',
  user: '<path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="8" r="5"/>',
  x: '<path d="m18 6-12 12M6 6l12 12"/>',
}

function icon(name, size = 16) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || ''}</svg>`
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character])
}

function renderCode(code, language, showLineNumbers) {
  const highlighted = escapeHtml(code)
  const lines = highlighted.split('\n')
  const safeLanguage = escapeHtml(language || 'text')
  const codeId = `code-${encodeURIComponent(code)}`
  const copied = state.copied === codeId
  return `<div class="code-block"><div class="code-block__header"><div class="code-block__language"><span class="code-language-dot"></span>${safeLanguage}</div><button class="code-copy" type="button" data-action="copy-code" data-code="${encodeURIComponent(code)}" aria-label="${copied ? 'Code copied' : 'Copy code'}">${copied ? icon('check', 14) : icon('copy', 14)}<span>${copied ? 'Copied' : 'Copy'}</span></button></div><div class="code-block__body${showLineNumbers ? '' : ' no-line-numbers'}"><pre aria-label="${safeLanguage} code"><code>${lines.map((line, index) => `<span class="code-line">${showLineNumbers ? `<span class="line-number" aria-hidden="true">${index + 1}</span>` : ''}<span class="line-content">${line || '&nbsp;'}</span></span>`).join('')}</code></pre></div></div>`
}

function renderInline(text) {
  const codeParts = []
  let escaped = escapeHtml(text)
  escaped = escaped.replace(/`([^`]+)`/g, (_, code) => {
    const index = codeParts.push(`<code>${code}</code>`) - 1
    return `\u0000${index}\u0000`
  })
  escaped = escaped.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+|mailto:[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
  escaped = escaped.replace(/\*\*(.+?)\*\*|__(.+?)__/g, '<strong>$1$2</strong>')
  escaped = escaped.replace(/~~(.+?)~~/g, '<del>$1</del>')
  escaped = escaped.replace(/(^|[^*])\*([^*]+)\*|(^|[^_])_([^_]+)_/g, (_, starPrefix, starContent, underscorePrefix, underscoreContent) => (
    `${starPrefix || underscorePrefix || ''}<em>${starContent || underscoreContent}</em>`
  ))
  return escaped.replace(/\u0000(\d+)\u0000/g, (_, index) => codeParts[Number(index)])
}

function renderMarkdown(content, settings) {
  const lines = String(content).replace(/\r\n/g, '\n').split('\n')
  const blocks = []
  let paragraph = []
  const flushParagraph = () => {
    if (paragraph.length) blocks.push(`<p>${paragraph.map(renderInline).join('<br>')}</p>`)
    paragraph = []
  }
  let index = 0
  while (index < lines.length) {
    const line = lines[index]
    const fence = line.match(/^\s*```([\w+#.-]*)\s*$/)
    if (fence) {
      flushParagraph()
      const codeLines = []
      index++
      while (index < lines.length && !/^\s*```\s*$/.test(lines[index])) codeLines.push(lines[index++])
      blocks.push(renderCode(codeLines.join('\n'), fence[1] || 'text', settings.showLineNumbers))
      index++
      continue
    }
    if (!line.trim()) {
      flushParagraph()
      index++
      continue
    }
    const heading = line.match(/^(#{1,6})\s+(.+)$/)
    if (heading) {
      flushParagraph()
      const level = heading[1].length
      blocks.push(`<h${level}>${renderInline(heading[2])}</h${level}>`)
      index++
      continue
    }
    if (/^\s*\|/.test(line) && index + 1 < lines.length && /^\s*\|?[\s:|-]+\|/.test(lines[index + 1])) {
      flushParagraph()
      const cells = (row) => row.trim().replace(/^\||\|$/g, '').split('|').map((cell) => cell.trim())
      const headers = cells(line)
      index += 2
      const rows = []
      while (index < lines.length && /^\s*\|/.test(lines[index])) rows.push(cells(lines[index++]))
      blocks.push(`<div class="markdown-table-wrap"><table><thead><tr>${headers.map((cell) => `<th>${renderInline(cell)}</th>`).join('')}</tr></thead><tbody>${rows.map((row) => `<tr>${headers.map((_, cellIndex) => `<td>${renderInline(row[cellIndex] || '')}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`)
      continue
    }
    if (/^\s*>\s?/.test(line)) {
      flushParagraph()
      const quote = []
      while (index < lines.length && /^\s*>\s?/.test(lines[index])) quote.push(lines[index++].replace(/^\s*>\s?/, ''))
      blocks.push(`<blockquote>${renderMarkdown(quote.join('\n'), settings)}</blockquote>`)
      continue
    }
    if (/^\s*[-*+]\s+/.test(line) || /^\s*\d+[.)]\s+/.test(line)) {
      flushParagraph()
      const ordered = /^\s*\d+[.)]\s+/.test(line)
      const items = []
      const pattern = ordered ? /^\s*\d+[.)]\s+(.*)$/ : /^\s*[-*+]\s+(.*)$/
      while (index < lines.length && pattern.test(lines[index])) {
        const item = lines[index++].match(pattern)[1]
        items.push(`<li>${renderInline(item)}</li>`)
      }
      blocks.push(`<${ordered ? 'ol' : 'ul'}>${items.join('')}</${ordered ? 'ol' : 'ul'}>`)
      continue
    }
    paragraph.push(line)
    index++
  }
  flushParagraph()
  return blocks.join('')
}

function dateGroup(value) {
  const date = new Date(value)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  const weekAgo = new Date(today)
  weekAgo.setDate(today.getDate() - 7)
  if (date >= today) return 'Today'
  if (date >= yesterday) return 'Yesterday'
  if (date >= weekAgo) return 'Previous 7 days'
  return 'Older'
}

function sortedConversations() {
  const query = state.search.trim().toLowerCase()
  return state.conversations
    .filter((conversation) => !query || conversation.title.toLowerCase().includes(query))
    .sort((left, right) => new Date(right.updatedAt) - new Date(left.updatedAt))
}

function renderSidebar() {
  const conversations = sortedConversations()
  const groups = ['Today', 'Yesterday', 'Previous 7 days', 'Older']
  const history = groups.map((group) => {
    const entries = conversations.filter((conversation) => dateGroup(conversation.updatedAt) === group)
    if (!entries.length) return ''
    return `<section class="history-group">${state.collapsed ? '' : `<h2>${group}</h2>`}${entries.map((conversation) => `
      <div class="conversation-item-wrap${state.view !== 'tokenizer' && state.activeId === conversation.id ? ' is-active' : ''}">
        <button class="conversation-item" type="button" data-action="select-conversation" data-id="${escapeHtml(conversation.id)}" title="${escapeHtml(conversation.title)}">
          ${icon('message', 15)}${state.collapsed ? '' : `<span>${escapeHtml(conversation.title)}</span>`}
        </button>
        ${state.collapsed ? '' : `<button type="button" class="conversation-more" data-action="conversation-menu" data-id="${escapeHtml(conversation.id)}" aria-label="Options for ${escapeHtml(conversation.title)}" aria-expanded="${state.menuId === conversation.id}">${icon('more', 16)}</button>`}
        ${state.menuId === conversation.id ? `<div class="conversation-menu"><button type="button" data-action="rename" data-id="${escapeHtml(conversation.id)}"><span>Rename</span></button><button type="button" class="danger-menu-item" data-action="delete" data-id="${escapeHtml(conversation.id)}">${icon('trash', 14)}<span>Delete</span></button></div>` : ''}
      </div>`).join('')}</section>`
  }).join('')
  return `${state.mobileOpen ? '<button type="button" class="mobile-scrim" data-action="close-mobile" aria-label="Close navigation"></button>' : ''}
    <aside class="sidebar${state.collapsed ? ' sidebar--collapsed' : ''}${state.mobileOpen ? ' sidebar--mobile-open' : ''}">
      <div class="sidebar-top">
        <div class="brand-button" aria-hidden="true"><span class="brand-mark">${icon('user', 18)}</span></div>
        <button type="button" class="icon-button sidebar-mobile-close" data-action="close-mobile" aria-label="Close sidebar">${icon('x', 18)}</button>
      </div>
      <button type="button" class="new-chat-button${state.collapsed ? ' new-chat-button--icon' : ''}" data-action="new-chat" title="New chat">${icon('plus', 17)}${state.collapsed ? '' : '<span>New chat</span><kbd>Ctrl ⇧ N</kbd>'}</button>
      <button type="button" class="sidebar-nav-button tokenizer-nav-button${state.view === 'tokenizer' ? ' is-active' : ''}" data-action="open-tokenizer" aria-current="${state.view === 'tokenizer' ? 'page' : 'false'}" title="BPE Tokenizer">${icon('code', 16)}${state.collapsed ? '' : '<span>BPE Tokenizer</span>'}</button>
      ${state.collapsed ? '' : `<label class="sidebar-search">${icon('search', 15)}<input type="search" data-input="search" value="${escapeHtml(state.search)}" placeholder="Search conversations"></label>`}
      <div class="history-heading">${state.collapsed ? `<span class="collapsed-history-icon">${icon('message', 16)}</span>` : '<span>YOUR WORKSPACE</span><button type="button" class="history-add" data-action="new-chat" aria-label="New conversation">' + icon('plus', 15) + '</button>'}</div>
      <nav class="conversation-list" aria-label="Conversation history">${history}${conversations.length === 0 && state.search.trim() && !state.collapsed ? `<div class="search-empty">${icon('search', 17)}<span>No conversations found</span><small>Try another search term.</small></div>` : ''}</nav>
      <div class="sidebar-bottom">
        <button type="button" class="sidebar-nav-button" data-action="open-help" title="Help & shortcuts">${icon('help', 17)}${state.collapsed ? '' : '<span>Help & shortcuts</span>'}</button>
        <div class="sidebar-user"><span class="user-avatar">${icon('user', 16)}</span>${state.collapsed ? '' : '<span class="user-info"><strong>Workspace</strong><small>Personal space</small></span><div class="user-menu-wrap"><button type="button" class="user-menu" data-action="toggle-user-menu" title="Workspace options" aria-label="Workspace options" aria-expanded="' + state.userMenuOpen + '">' + icon('more', 18) + '</button>' + (state.userMenuOpen ? '<div class="user-menu-popover"><button type="button" data-action="open-settings">' + icon('settings', 15) + '<span>Settings</span></button></div>' : '') + '</div>'}</div>
      </div>
    </aside>`
}

function renderHeader(conversation) {
  const title = state.view === 'tokenizer' ? 'BPE Tokenizer' : conversation?.title
  return `<header class="chat-header">
    <div class="chat-header__left">
      <button type="button" class="icon-button header-sidebar-toggle" data-action="toggle-sidebar" aria-label="${state.collapsed ? 'Expand sidebar' : 'Collapse sidebar'}" title="${state.collapsed ? 'Show sidebar' : 'Hide sidebar'}">${icon('chevronsLeft', 18)}</button>
      <button type="button" class="icon-button mobile-menu-button" data-action="toggle-sidebar" aria-label="Open navigation">${icon('menu', 19)}</button><span class="header-divider"></span>
      ${title ? `<div class="conversation-title-wrap"><h1 title="${escapeHtml(title)}">${escapeHtml(title)}</h1></div>` : ''}
    </div>
    <div class="chat-header__actions"><button type="button" class="new-conversation-icon" data-action="new-chat" title="New conversation" aria-label="New conversation">${icon('messagePlus', 17)}<span>New chat</span></button>
      <div class="header-menu-wrap"><button type="button" class="icon-button" data-action="toggle-header-menu" aria-label="More conversation options" aria-expanded="${state.headerMenuOpen}">${icon('more', 19)}</button>
        ${state.headerMenuOpen ? `<div class="header-menu">${conversation ? `<button type="button" data-action="rename" data-id="${escapeHtml(conversation.id)}">${icon('pencil', 15)}Rename conversation</button><button type="button" class="danger-menu-item" data-action="delete" data-id="${escapeHtml(conversation.id)}">${icon('trash', 15)}Delete conversation</button>` : ''}<button type="button" data-action="open-help">Keyboard shortcuts</button></div>` : ''}
      </div></div>
  </header>`
}

const suggestions = [
  { title: 'Build', description: 'Create a website', icon: 'code', prompt: 'Create a website with HTML, CSS and JavaScript' },
  { title: 'Debug', description: 'Help me debug my code', icon: 'bug', prompt: 'Help me debug my code' },
  { title: 'Explain', description: 'Explain this function', icon: 'braces', prompt: 'Explain this function' },
  { title: 'Generate', description: 'Create an API', icon: 'fileCode', prompt: 'Create an API' },
]

function renderWelcome() {
  return `<section class="welcome-screen"><div class="welcome-content"><div class="eyebrow">YOUR SPACE TO THINK IN CODE</div>
    <h1>Build anything</h1><p class="welcome-subtitle">Your AI coding workspace for building, debugging and understanding code.</p>
    <div class="suggestion-grid">${suggestions.map((item) => `<button class="suggestion-card" type="button" data-action="suggestion" data-prompt="${encodeURIComponent(item.prompt)}"><span class="suggestion-icon">${icon(item.icon, 17)}</span><span class="suggestion-copy"><span class="suggestion-title">${item.title}</span><span class="suggestion-description">${item.description}</span></span>${icon('arrowUpRight', 15)}</button>`).join('')}</div>
    </div></section>`
}

function renderTokenizer() {
  const result = state.tokenizerResult
  const results = result ? `<section class="tokenizer-results" aria-live="polite">
    <div class="tokenizer-results__heading"><div><span class="tokenizer-eyebrow">RESULTS</span><h2>Vocabulary progression</h2></div><span class="tokenizer-step-count">${result.steps.length} ${result.steps.length === 1 ? 'step' : 'steps'}</span></div>
    <div class="tokenizer-step-list">${result.steps.map((step, index) => `<article class="tokenizer-step"><div class="tokenizer-step__heading"><strong>${index === 0 ? 'Initial vocabulary' : `After merge ${index}`}</strong><span>${step.length} ${step.length === 1 ? 'token' : 'tokens'}</span></div><div class="tokenizer-token-list">${step.length ? step.map((token) => `<code class="tokenizer-token">${escapeHtml(token)}</code>`).join('') : '<span class="tokenizer-empty-step">No tokens</span>'}</div></article>`).join('')}</div>
    <div class="tokenizer-results__heading tokenizer-results__heading--final"><div><span class="tokenizer-eyebrow">ENCODED WORDS</span><h2>Final token sequences</h2></div></div>
    <div class="tokenizer-final-list">${result.words.length ? result.words.map((word, index) => `<div class="tokenizer-final-word"><span>Word ${index + 1} <small>×${word.count}</small></span><div>${word.tokens.map((token) => `<code class="tokenizer-token">${escapeHtml(token)}</code>`).join('')}</div></div>`).join('') : '<p class="tokenizer-empty-step">No words found in the input.</p>'}</div>
  </section>` : ''
  return `<div class="tokenizer-page"><section class="tokenizer-intro"><div class="tokenizer-icon">${icon('code', 20)}</div><span class="tokenizer-eyebrow">TEXT PROCESSING TOOL</span><h1>BPE Tokenizer</h1><p>Learn byte-pair-style merges from your text and inspect how the vocabulary evolves.</p></section>
    <section class="tokenizer-input-panel"><label for="tokenizer-text">Input text</label><textarea id="tokenizer-text" data-input="tokenizer-text" placeholder="Enter words separated by spaces..." spellcheck="false">${escapeHtml(state.tokenizerText)}</textarea>
      <div class="tokenizer-input-footer"><span>${icon('sparkles', 14)} Up to 21 merge rounds · Whitespace-separated words</span><button class="tokenizer-run-button" type="button" data-action="run-tokenizer" ${state.tokenizerRunning || !state.tokenizerText ? 'disabled' : ''}>${state.tokenizerRunning ? '<span class="tokenizer-spinner"></span>Running Python…' : `${icon('arrowUp', 15)} Run tokenizer`}</button></div>
    </section>
    ${state.tokenizerError ? `<div class="tokenizer-error" role="alert">${escapeHtml(state.tokenizerError)}</div>` : ''}
    ${results}
  </div>`
}

function loadPyodideScript() {
  if (typeof window.loadPyodide === 'function') return Promise.resolve()
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Could not load Pyodide from jsDelivr. Check your internet connection and try again.'))
    document.head.append(script)
  })
}

async function getTokenizerRuntime() {
  if (!state.tokenizerRuntimePromise) {
    state.tokenizerRuntimePromise = (async () => {
      await loadPyodideScript()
      const runtime = await window.loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/' })
      const response = await fetch('/tokenizer.py')
      if (!response.ok) throw new Error(`Could not load tokenizer.py (HTTP ${response.status}).`)
      await runtime.runPythonAsync(await response.text())
      return runtime
    })()
  }
  try {
    return await state.tokenizerRuntimePromise
  } catch (error) {
    state.tokenizerRuntimePromise = null
    throw error
  }
}

async function runTokenizer() {
  if (state.tokenizerRunning || !state.tokenizerText) return
  const inputText = state.tokenizerText
  state.tokenizerRunning = true
  state.tokenizerError = ''
  state.tokenizerResult = null
  render()
  try {
    const runtime = await getTokenizerRuntime()
    runtime.globals.set('input_text', inputText)
    let proxy
    try {
      proxy = await runtime.runPythonAsync('tokenize(input_text)')
      state.tokenizerResult = proxy.toJs({ dict_converter: Object.fromEntries })
    } finally {
      proxy?.destroy()
      runtime.globals.delete('input_text')
    }
  } catch (error) {
    console.error('The Python BPE tokenizer failed to run.', error)
    state.tokenizerError = error instanceof Error ? error.message : 'The tokenizer could not be run.'
  } finally {
    state.tokenizerRunning = false
    render()
  }
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function renderComposer(disabled) {
  const attachments = state.attachments.map((item, index) => `<div class="attachment-card"><span class="attachment-file-icon">${icon('fileCode', 17)}</span><span class="attachment-details"><span class="attachment-name" title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</span><span class="attachment-meta">${escapeHtml(item.extension)} · ${formatSize(item.size)}</span></span><button class="attachment-remove" type="button" data-action="remove-attachment" data-index="${index}" aria-label="Remove ${escapeHtml(item.name)}">${icon('x', 14)}</button></div>`).join('')
  const canSend = !disabled && (state.draft.trim() || state.attachments.length)
  return `<div class="composer-wrap"><div class="composer-shell">${attachments ? `<div class="attachment-list">${attachments}</div>` : ''}
    <textarea data-input="draft" placeholder="Describe what you want to build..." rows="1" aria-label="Describe what you want to build" ${disabled ? 'disabled' : ''}>${escapeHtml(state.draft)}</textarea>
    <div class="composer-toolbar"><div class="composer-tools"><input class="visually-hidden" data-input="files" type="file" multiple tabindex="-1" aria-hidden="true"><input class="visually-hidden" data-input="images" type="file" accept="image/*" multiple tabindex="-1" aria-hidden="true">
      <button type="button" class="composer-icon-button" data-action="attach-files" aria-label="Attach files" title="Attach files">${icon('paperclip', 17)}</button><button type="button" class="composer-icon-button" data-action="attach-images" aria-label="Attach image" title="Attach image">${icon('image', 17)}</button>
      <div class="tools-menu-wrap"><button type="button" class="composer-tool-button${state.toolsOpen ? ' is-active' : ''}" data-action="toggle-tools" aria-expanded="${state.toolsOpen}">${icon('plus', 15)}<span>Tools</span>${icon('chevronDown', 13)}</button>
        ${state.toolsOpen ? `<div class="tools-popover">${['Explain this code', 'Write a test for this', 'Refactor for clarity'].map((tool) => `<button type="button" data-action="insert-tool" data-prompt="${encodeURIComponent(tool)}">${icon('filePlus', 15)}${tool}</button>`).join('')}</div>` : ''}</div>
    </div><div class="composer-submit-group"><span class="composer-hint">${state.settings.enterToSend ? '↵ to send' : '↵ for new line'}</span><button type="button" class="send-button" data-action="send" ${canSend ? '' : 'disabled'} aria-label="Send message" title="Send message">${icon('arrowUp', 18)}</button></div></div>
    </div></div>`
}

function formatTime(value) {
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(value))
}

function renderMessage(message) {
  const isUser = message.role === 'user'
  const content = message.content || ''
  const body = message.status === 'thinking' || (message.status === 'streaming' && !content)
    ? '<div class="typing-indicator" aria-label="CodeMind is thinking"><span></span><span></span><span></span></div>'
    : message.status === 'error'
      ? `<div class="message-error"><span>Something went wrong.</span><button type="button" class="retry-button" data-action="retry" data-id="${escapeHtml(message.id)}">${icon('rotate', 14)} Retry</button></div>`
      : message.status === 'streaming' && !content ? '' : content
        ? `<div class="markdown-body${state.settings.compactMode ? ' markdown-body--compact' : ''}">${isUser ? `<p>${escapeHtml(content).replace(/\n/g, '<br>')}</p>` : renderMarkdown(content, state.settings)}${message.status === 'streaming' ? '<span class="stream-caret" aria-label="Response streaming"></span>' : ''}</div>`
        : '<p class="empty-response">No response text was returned. Try asking in a different way.</p>'
  const attachments = message.attachments?.length ? `<div class="message-attachments">${message.attachments.map((file) => `<span class="message-attachment"><span class="attachment-extension">${escapeHtml(file.extension || 'FILE')}</span><span class="message-attachment__name">${escapeHtml(file.name)}</span></span>`).join('')}</div>` : ''
  const copy = !isUser && message.status === 'done' && content ? `<div class="message-actions"><button type="button" data-action="copy-message" data-id="${escapeHtml(message.id)}" aria-label="Copy response">${state.copied === message.id ? icon('check', 14) : icon('copy', 14)}<span>${state.copied === message.id ? 'Copied' : 'Copy'}</span></button></div>` : ''
  return `<article class="message-row${isUser ? ' message-row--user' : ''}"><div class="message-avatar${isUser ? ' message-avatar--user' : ''}" aria-hidden="true">${icon(isUser ? 'user' : 'bot', isUser ? 16 : 17)}</div><div class="message-content"><div class="message-meta"><span class="message-author">${isUser ? 'You' : 'CodeMind'}</span>${state.settings.showTimestamps ? `<time dateTime="${escapeHtml(message.createdAt)}">${formatTime(message.createdAt)}</time>` : ''}</div>${body}${attachments}${copy}</div></article>`
}

function settingRow(title, description, key) {
  return `<label class="setting-row"><span class="setting-copy"><strong>${title}</strong><small>${description}</small></span><input type="checkbox" data-setting="${key}" ${state.settings[key] ? 'checked' : ''}><span class="toggle-switch" aria-hidden="true"><span></span></span></label>`
}

function renderModal() {
  if (!state.settingsOpen && !state.helpOpen) return ''
  const title = state.settingsOpen ? 'Settings' : 'Help & keyboard shortcuts'
  const content = state.settingsOpen
    ? `<div class="settings-content"><section class="settings-section"><div class="settings-section-heading"><h3>Appearance</h3><p>Make your workspace feel like yours.</p></div><div class="appearance-options">${[['dark', 'Dark', 'moon'], ['light', 'Light', 'sun'], ['system', 'System', 'monitor']].map(([id, label, image]) => `<button type="button" class="appearance-option${state.settings.appearance === id ? ' is-selected' : ''}" data-action="appearance" data-value="${id}">${icon(image, 17)}<span>${label}</span>${state.settings.appearance === id ? `${icon('check', 14)}` : ''}</button>`).join('')}</div></section>
      <section class="settings-section"><div class="settings-section-heading"><h3>Interface</h3><p>Choose what works best for your workflow.</p></div>${settingRow('Compact mode', 'Tighten up spacing in conversations.', 'compactMode')}${settingRow('Show timestamps', 'See when each message was sent.', 'showTimestamps')}${settingRow('Show line numbers', 'Add line numbers to code blocks.', 'showLineNumbers')}</section>
      <section class="settings-section"><div class="settings-section-heading"><h3>Chat</h3><p>Adjust how messages are composed.</p></div>${settingRow('Enter to send', 'Use Enter to send and Shift + Enter for a new line.', 'enterToSend')}${settingRow('Streaming animation', 'Stream responses at a relaxed pace.', 'streamingAnimation')}${settingRow('Explain while writing code', 'Explain generated code when this preference is on.', 'explainWhileCoding')}${state.settings.explainWhileCoding ? `<label class="setting-row explanation-style-row"><span class="setting-copy"><strong>Explanation style</strong><small>Choose how code is explained.</small></span><select data-setting-select="explanationStyle" aria-label="Explanation style"><option value="brief" ${state.settings.explanationStyle === 'brief' ? 'selected' : ''}>Brief function summary</option><option value="line-by-line" ${state.settings.explanationStyle === 'line-by-line' ? 'selected' : ''}>Line by line</option></select></label>` : ''}</section>
      <div class="settings-local-note"><span>Your preferences are saved on this device only.</span></div></div>`
    : `<div class="help-content"><p>Move through your CodeMind workspace a little faster.</p><div class="shortcut-row"><span>New conversation</span><kbd>Ctrl / ⌘ + Shift + N</kbd></div><div class="shortcut-row"><span>Search conversations</span><kbd>Ctrl / ⌘ + K</kbd></div><div class="shortcut-row"><span>Send message</span><kbd>${state.settings.enterToSend ? 'Enter' : 'Send button'}</kbd></div><div class="shortcut-row"><span>New line</span><kbd>${state.settings.enterToSend ? 'Shift + Enter' : 'Enter'}</kbd></div><div class="help-footer">CodeMind is a standalone frontend prototype. Your chats stay in this browser.</div></div>`
  return `<div class="modal-backdrop" data-action="backdrop" role="presentation"><section class="modal-card ${state.settingsOpen ? 'settings-modal' : 'help-modal'}" role="dialog" aria-modal="true" aria-label="${title}"><div class="modal-header"><h2>${title}</h2><button type="button" class="icon-button" data-action="close-modal" aria-label="Close">${icon('x', 18)}</button></div>${content}</section></div>`
}

function applyTheme() {
  const light = state.settings.appearance === 'light'
    || (state.settings.appearance === 'system' && window.matchMedia('(prefers-color-scheme: light)').matches)
  document.documentElement.dataset.theme = light ? 'light' : 'dark'
}

function render() {
  const active = state.conversations.find((conversation) => conversation.id === state.activeId) || null
  const busy = active ? state.busyIds.has(active.id) : false
  const focused = document.activeElement?.dataset?.input
  const selection = focused === 'draft' || focused === 'search' || focused === 'tokenizer-text'
    ? [document.activeElement.selectionStart, document.activeElement.selectionEnd]
    : null
  root.innerHTML = `<div class="app-shell${state.settings.compactMode ? ' app-shell--compact' : ''}">${renderSidebar()}<main class="main-panel">${renderHeader(active)}${state.view === 'tokenizer' ? renderTokenizer() : `<div class="chat-stage${active ? ' chat-stage--conversation' : ''}">
    ${active ? `<div class="message-scroll-area"><div class="message-list">${active.messages.map(renderMessage).join('')}<div data-message-end></div></div></div><div class="composer-dock">${renderComposer(busy)}</div>` : `${renderWelcome()}<div class="welcome-composer">${renderComposer(false)}</div>`}
    </div>`}</main>${renderModal()}</div>`
  if (focused) {
    const field = root.querySelector(`[data-input="${focused}"]`)
    field?.focus()
    if (selection && field) field.setSelectionRange(...selection)
  }
  applyTheme()
  storeConversations(state.conversations)
  storeSettings(state.settings)
  const messageScrollArea = root.querySelector('.message-scroll-area')
  if (messageScrollArea && state.busyIds.size) {
    messageScrollArea.scrollTop = messageScrollArea.scrollHeight
  } else {
    root.querySelector('[data-message-end]')?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }
}

function updateConversation(conversationId, updater) {
  state.conversations = state.conversations.map((conversation) => conversation.id === conversationId ? updater(conversation) : conversation)
  render()
}

function updateMessage(conversationId, messageId, updater) {
  updateConversation(conversationId, (conversation) => ({
    ...conversation,
    messages: conversation.messages.map((message) => message.id === messageId ? updater(message) : message),
    updatedAt: timestamp(),
  }))
}

async function runMockResponse(conversationId, assistantId, prompt) {
  state.busyIds.add(conversationId)
  render()
  try {
    await wait(680)
    const response = createMockResponse(prompt, {
      explainWhileCoding: state.settings.explainWhileCoding,
      explanationStyle: state.settings.explanationStyle,
    })
    if (!response) {
      updateMessage(conversationId, assistantId, (message) => ({ ...message, status: 'done', content: '' }))
      return
    }
    updateMessage(conversationId, assistantId, (message) => ({ ...message, status: 'streaming' }))
    if (!state.settings.streamingAnimation) {
      updateMessage(conversationId, assistantId, (message) => ({ ...message, status: 'done', content: response }))
      return
    }
    const characters = Array.from(response)
    const chunkSize = 24
    let displayed = ''
    for (let index = 0; index < characters.length; index += chunkSize) {
      displayed += characters.slice(index, index + chunkSize).join('')
      updateMessage(conversationId, assistantId, (message) => ({ ...message, content: displayed }))
      await wait(30)
    }
    updateMessage(conversationId, assistantId, (message) => ({ ...message, content: response, status: 'done' }))
  } catch (error) {
    console.error('The local CodeMind demonstration response failed.', error)
    updateMessage(conversationId, assistantId, (message) => ({ ...message, status: 'error', content: '' }))
  } finally {
    state.busyIds.delete(conversationId)
    render()
  }
}

function createConversationTitle(prompt) {
  const normalized = prompt.replace(/\s+/g, ' ').trim()
  const firstSentence = normalized.match(/^.*?[.!?](?=\s|$)/)?.[0] || normalized
  const requestPrefix = /^(?:(?:please\s+)?(?:can|could|would)\s+you\s+(?:please\s+)?|i\s+(?:(?:would like|want|need)\s+you\s+to|would like|want|need)\s+|please\s+|help me\s+)/i
  let title = firstSentence.replace(/^(?:(?:hi|hello)[,!?\s]+)?/i, '').trim()
  while (requestPrefix.test(title)) title = title.replace(requestPrefix, '').trim()
  title ||= firstSentence

  if (title.length <= 36) return title
  const shortened = title.slice(0, 35).replace(/\s+\S*$/, '').trimEnd()
  return `${shortened || title.slice(0, 35).trimEnd()}…`
}

function sendMessage() {
  const text = state.draft.trim()
  if (!text && !state.attachments.length) return
  const createdAt = timestamp()
  let conversationId = state.activeId
  if (!conversationId) {
    conversationId = createId()
    const title = text ? createConversationTitle(text) : state.attachments[0].name || 'New conversation'
    state.conversations.unshift({
      id: conversationId,
      title,
      updatedAt: createdAt,
      messages: [],
    })
    state.activeId = conversationId
  }
  const prompt = text || `Please review the attached file${state.attachments.length > 1 ? 's' : ''}.`
  const attachments = state.attachments.map(({ name, size, extension, mimeType }) => ({ name, size, extension, mimeType }))
  const assistantId = createId()
  updateConversation(conversationId, (conversation) => ({
    ...conversation,
    updatedAt: createdAt,
    messages: [...conversation.messages, {
      id: createId(), role: 'user', content: text || prompt, attachments, createdAt,
    }, {
      id: assistantId, role: 'assistant', content: '', status: 'thinking', createdAt: timestamp(),
    }],
  }))
  state.draft = ''
  state.attachments = []
  runMockResponse(conversationId, assistantId, prompt)
}

function startNewChat() {
  state.view = 'chat'
  state.activeId = null
  state.mobileOpen = false
  state.draft = ''
  state.attachments = []
  state.menuId = null
  render()
}

function toggleSidebar() {
  if (window.matchMedia('(max-width: 760px)').matches) state.mobileOpen = !state.mobileOpen
  else state.collapsed = !state.collapsed
  render()
}

function renameConversation(conversationId) {
  const conversation = state.conversations.find((item) => item.id === conversationId)
  if (!conversation) return
  const title = window.prompt('Rename conversation', conversation.title)
  if (title?.trim()) updateConversation(conversationId, (item) => ({ ...item, title: title.trim(), updatedAt: timestamp() }))
}

function deleteConversation(conversationId) {
  const conversation = state.conversations.find((item) => item.id === conversationId)
  if (!conversation || !window.confirm(`Delete "${conversation.title}"? This cannot be undone.`)) return
  state.conversations = state.conversations.filter((item) => item.id !== conversationId)
  if (state.activeId === conversationId) state.activeId = null
  render()
}

function retryMessage(messageId) {
  const conversation = state.conversations.find((item) => item.id === state.activeId)
  if (!conversation || state.busyIds.has(conversation.id)) return
  const index = conversation.messages.findIndex((message) => message.id === messageId)
  const previousUser = conversation.messages.slice(0, index).reverse().find((message) => message.role === 'user')
  if (!previousUser) return
  updateMessage(conversation.id, messageId, (message) => ({ ...message, status: 'thinking', content: '' }))
  runMockResponse(conversation.id, messageId, previousUser.content || 'Please review the attached file.')
}

function insertPrompt(prompt) {
  state.draft = prompt
  state.toolsOpen = false
  render()
  root.querySelector('[data-input="draft"]')?.focus()
}

function addFiles(fileList) {
  for (const file of Array.from(fileList || [])) {
    const extension = file.name.includes('.') ? file.name.split('.').pop().toUpperCase() : 'FILE'
    state.attachments.push({ name: file.name, size: file.size, extension, mimeType: file.type, file })
  }
  render()
}

async function copyText(text, id) {
  try {
    await navigator.clipboard.writeText(text)
    state.copied = id
    render()
    window.setTimeout(() => {
      if (state.copied === id) {
        state.copied = ''
        render()
      }
    }, 1600)
  } catch (error) {
    console.error('Could not copy text to the clipboard.', error)
  }
}

root.addEventListener('click', (event) => {
  const target = event.target.closest('[data-action]')
  if (!target) return
  const action = target.dataset.action
  const id = target.dataset.id
  if (action === 'backdrop' && event.target !== target) return
  switch (action) {
    case 'new-chat': startNewChat(); break
    case 'open-tokenizer': state.view = 'tokenizer'; state.mobileOpen = false; state.headerMenuOpen = false; render(); break
    case 'run-tokenizer': runTokenizer(); break
    case 'toggle-sidebar': toggleSidebar(); break
    case 'close-mobile': state.mobileOpen = false; render(); break
    case 'open-settings': state.settingsOpen = true; state.helpOpen = false; state.userMenuOpen = false; render(); break
    case 'open-help': state.helpOpen = true; state.settingsOpen = false; state.headerMenuOpen = false; render(); break
    case 'close-modal':
    case 'backdrop': state.settingsOpen = false; state.helpOpen = false; render(); break
    case 'select-conversation': state.view = 'chat'; state.activeId = id; state.mobileOpen = false; state.draft = ''; state.attachments = []; render(); break
    case 'conversation-menu': state.menuId = state.menuId === id ? null : id; render(); break
    case 'rename': state.menuId = null; state.headerMenuOpen = false; renameConversation(id); break
    case 'delete': state.menuId = null; state.headerMenuOpen = false; deleteConversation(id); break
    case 'toggle-header-menu': state.headerMenuOpen = !state.headerMenuOpen; render(); break
    case 'toggle-user-menu': state.userMenuOpen = !state.userMenuOpen; render(); break
    case 'suggestion': insertPrompt(decodeURIComponent(target.dataset.prompt)); break
    case 'insert-tool': insertPrompt(`${decodeURIComponent(target.dataset.prompt)}: `); break
    case 'toggle-tools': state.toolsOpen = !state.toolsOpen; render(); break
    case 'attach-files': root.querySelector('[data-input="files"]')?.click(); break
    case 'attach-images': root.querySelector('[data-input="images"]')?.click(); break
    case 'remove-attachment': state.attachments.splice(Number(target.dataset.index), 1); render(); break
    case 'send': sendMessage(); break
    case 'retry': retryMessage(id); break
    case 'appearance': state.settings.appearance = target.dataset.value; render(); break
    case 'copy-message': {
      const message = state.conversations.flatMap((conversation) => conversation.messages).find((item) => item.id === id)
      if (message) copyText(message.content, id)
      break
    }
    case 'copy-code': copyText(decodeURIComponent(target.dataset.code), `code-${target.dataset.code}`); break
  }
})

root.addEventListener('input', (event) => {
  const input = event.target
  if (input.dataset.input === 'draft') {
    state.draft = input.value
    input.style.height = 'auto'
    input.style.height = `${Math.min(input.scrollHeight, 200)}px`
    const button = root.querySelector('.send-button')
    if (button) button.disabled = !input.value.trim() && state.attachments.length === 0
  } else if (input.dataset.input === 'search') {
    state.search = input.value
    const start = input.selectionStart
    render()
    const replacement = root.querySelector('[data-input="search"]')
    replacement?.setSelectionRange(start, start)
  } else if (input.dataset.input === 'tokenizer-text') {
    state.tokenizerText = input.value
    state.tokenizerResult = null
    state.tokenizerError = ''
    render()
  }
})

root.addEventListener('change', (event) => {
  const input = event.target
  if (input.dataset.input === 'files' || input.dataset.input === 'images') addFiles(input.files)
  if (input.dataset.setting) {
    state.settings[input.dataset.setting] = input.type === 'checkbox' ? input.checked : input.value
    render()
  }
  if (input.dataset.settingSelect) {
    state.settings[input.dataset.settingSelect] = input.value
    render()
  }
})

root.addEventListener('keydown', (event) => {
  if (event.target.matches('[data-input="draft"]') && event.key === 'Enter' && !event.shiftKey && state.settings.enterToSend) {
    event.preventDefault()
    sendMessage()
  }
  if (event.key === 'Escape') {
    state.settingsOpen = false
    state.helpOpen = false
    state.mobileOpen = false
    state.menuId = null
    state.headerMenuOpen = false
    state.userMenuOpen = false
    state.toolsOpen = false
    render()
  }
})

window.addEventListener('keydown', (event) => {
  if (!(event.ctrlKey || event.metaKey)) return
  if (event.shiftKey && event.key.toLowerCase() === 'n') {
    event.preventDefault()
    startNewChat()
  } else if (event.key.toLowerCase() === 'k') {
    event.preventDefault()
    state.collapsed = false
    render()
    root.querySelector('[data-input="search"]')?.focus()
  }
})

window.matchMedia('(prefers-color-scheme: light)').addEventListener?.('change', () => {
  if (state.settings.appearance === 'system') applyTheme()
})

render()
