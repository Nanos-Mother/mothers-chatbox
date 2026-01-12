const API_URL = "https://mother-emojis.new-systems.dev/"

// Fade timer
let fadeTimer = null
function applyFadeTimer() {
    if (fadeTimer) {
        clearTimeout(fadeTimer)
    }
    
    messages.style.opacity = "1"
    
    fadeTimer = setTimeout(() => {
        messages.style.opacity = "0"
        fadeTimer = null
    }, 10000) // 10 seconds
}

// Messages
let tags = {
    "cyan": "color: #00FFFF;",
    "green": "color: #00FF00;",
    "blue": "color: #0000FF;",
    "purple": "color: #800080;",
    "marengo": "color: #800000;",
    "yellow": "color: #FFFF00;",
    "orange": "color: #FFA500;",
    "red": "color: #FF0000;",
    "grey": "color: #808080;",
    "bold": "font-weight: bold;",
    "italic": "font-style: italic;"
}

function parseTags(str) {
    const parts = []
    let lastIndex = 0
    
    const openTagRegex = /<([a-zA-Z0-9_]+)>/g
    let match
    
    while ((match = openTagRegex.exec(str)) !== null) {
        if (match.index < lastIndex) {
            continue
        }
        
        const tagName = match[1]
        const tagStart = match.index
        
        if (tagStart > lastIndex) {
            const textBefore = str.substring(lastIndex, tagStart)
            if (textBefore) {
                parts.push(textBefore)
            }
        }
        
        if (tags[tagName]) {
            let depth = 1
            let contentStart = openTagRegex.lastIndex
            let contentEnd = -1
            let i = contentStart
            
            while (i < str.length && depth > 0) {
                if (str.substring(i, i + 3) === '</>') {
                    depth--
                    if (depth === 0) {
                        contentEnd = i
                        break
                    }
                    i += 3
                } else if (str[i] === '<') {
                    const tagEnd = str.indexOf('>', i + 1)
                    if (tagEnd !== -1) {
                        const potentialTag = str.substring(i + 1, tagEnd)
                        if (tags[potentialTag]) {
                            depth++
                        }
                        i = tagEnd + 1
                    } else {
                        i++
                    }
                } else {
                    i++
                }
            }
            
            if (depth === 0 && contentEnd !== -1) {
                const tagContent = str.substring(contentStart, contentEnd)
                const tagEnd = contentEnd + 3
                
                const contentParts = parseTags(tagContent)
                const parentStyle = tags[tagName]
                
                if (contentParts.length === 0) {
                    parts.push({ style: parentStyle, content: "" })
                } else if (contentParts.length === 1 && typeof contentParts[0] === "string") {
                    parts.push({ style: parentStyle, content: contentParts[0] })
                } else {
                    for (const contentPart of contentParts) {
                        if (typeof contentPart === "string") {
                            if (contentPart) {
                                parts.push({ style: parentStyle, content: contentPart })
                            }
                        } else if (contentPart.style) {
                            const combinedStyle = parentStyle + " " + contentPart.style
                            parts.push({ style: combinedStyle, content: contentPart.content })
                        }
                    }
                }
                
                lastIndex = tagEnd
                openTagRegex.lastIndex = lastIndex
            } else {
                parts.push(match[0])
                lastIndex = openTagRegex.lastIndex
            }
        } else {
            parts.push(match[0])
            lastIndex = openTagRegex.lastIndex
        }
    }
    
    if (lastIndex < str.length) {
        const remainingText = str.substring(lastIndex)
        if (remainingText) {
            parts.push(remainingText)
        }
    }
    
    if (parts.length === 0) {
        return [str]
    }
    
    return parts
}

function parseEmojis(str) {
    const regex = /:([a-zA-Z0-9_]+):/g
    const parts = []
    let lastIndex = 0
    let match
    
    while ((match = regex.exec(str)) !== null) {
        const emoji = match[1]
        const text = str.substring(lastIndex, match.index)
        
        if (text) {
            parts.push(text)
        }
        
        parts.push({ emoji: emoji })
        lastIndex = regex.lastIndex
    }
    
    if (lastIndex < str.length) {
        const remainingText = str.substring(lastIndex)
        if (remainingText) {
            parts.push(remainingText)
        }
    }
    
    if (parts.length === 0) {
        return [str]
    }
    
    return parts
}

function decodeEscapeSequences(text) {
    return text
        .replace(/\\n/g, '\n')
        .replace(/\\t/g, '\t')
        .replace(/\\\\/g, '\\')
}

function processNewlinesAndTabs(text) {
    const processedText = text.replace(/\t/g, '    ')
    return processedText
}

function parseMessage(message) {
    const parts = parseEmojis(message)
    const result = []
    
    for (const part of parts) {
        if (typeof part === "string") {
            const tagParts = parseTags(part)
            result.push(...tagParts)
        } else {
            result.push(part)
        }
    }
    
    return result
}

async function addMessage(message, sender, avatar) {
    const msgDiv = document.createElement("div")
    msgDiv.className = "message"
    msgDiv.style.animation = "fadeIn 0.3s ease-out"

    if (avatar) {
        const avatarImg = document.createElement("img")
        avatarImg.src = avatar
        avatarImg.className = "avatar"
        msgDiv.appendChild(avatarImg)
    }

    if (sender) {
        const senderSpan = document.createElement("span")
        senderSpan.className = "sender"
        senderSpan.textContent = sender + ": "
        msgDiv.appendChild(senderSpan)
    }

    const parts = parseMessage(message)
    
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i]
        
        if (typeof part === "string") {
            const processedText = processNewlinesAndTabs(part)
            const lines = processedText.split('\n')
            
            for (let j = 0; j < lines.length; j++) {
                if (j > 0) {
                    const br = document.createElement("br")
                    msgDiv.appendChild(br)
                }
                if (lines[j]) {
                    const messageSpan = document.createElement("span")
                    messageSpan.textContent = lines[j]
                    messageSpan.className = "message"
                    msgDiv.appendChild(messageSpan)
                }
            }
        } else if (part.style) {
            const processedContent = processNewlinesAndTabs(part.content)
            const lines = processedContent.split('\n')
            
            for (let j = 0; j < lines.length; j++) {
                if (j > 0) {
                    const br = document.createElement("br")
                    msgDiv.appendChild(br)
                }
                if (lines[j]) {
                    const messageSpan = document.createElement("span")
                    messageSpan.style.cssText = part.style
                    messageSpan.textContent = lines[j]
                    messageSpan.className = "message"
                    msgDiv.appendChild(messageSpan)
                }
            }
        } else if (part.emoji) {           
            const exists = await fetch(`${API_URL}/exists/${part.emoji}`).then(response => response.json()).then(data => data.exists)
            if (exists) {
                const emojiImg = document.createElement("img")
                emojiImg.src = `${API_URL}/get/${part.emoji}`
                emojiImg.className = "emoji"
                emojiImg.title = `:${part.emoji}:`
                msgDiv.appendChild(emojiImg)
            } else {
                const messageSpan = document.createElement("span")
                messageSpan.textContent = `:${part.emoji}:`
                messageSpan.className = "message"
                msgDiv.appendChild(messageSpan)
            }
        }
    }

    const messagesContainer = document.getElementById("messages-container")
    messagesContainer.appendChild(msgDiv)
    
    void msgDiv.offsetWidth

    messagesContainer.scrollTop = messagesContainer.scrollHeight

    if (!isChatboxVisible)
        applyFadeTimer()
}

function clearMessages() {
    const messagesContainer = document.getElementById("messages")
    messagesContainer.innerHTML = ""
}

// Chatbox visibility
const chatbox = document.getElementById("chatbox")
const header = document.getElementById("header")
const messages = document.getElementById("messages")
const inputContainer = document.getElementById("input-container")

let data = {
    chatbox: {
        backgroundColor: "#473B2550",
        border: "1px solid #A28A5E80"
    }
}
function setChatboxVisible(visible) {
    const oldVisible = isChatboxVisible()
    if (visible) {
        header.style.opacity = "1"
        chatbox.style.backgroundColor = data.chatbox.backgroundColor
        chatbox.style.border = data.chatbox.border
        inputContainer.style.opacity = "1"

        if (fadeTimer) {
            clearTimeout(fadeTimer)
            fadeTimer = null
        }
        messages.style.opacity = "1"
    } else {
        closeEmojisPanel()
        header.style.opacity = "0"
        chatbox.style.backgroundColor = "#00000000"
        chatbox.style.border = chatbox.style.border.slice(0, -2) + "00"
        inputContainer.style.opacity = "0"
        
        applyFadeTimer()
    }

    if (typeof Events !== "undefined" && oldVisible !== visible) {
        Events.Call("ChatboxVisibilityChanged", visible)
    }
}

function isChatboxVisible() {
    return header.style.opacity !== "0"
}

function toggleChatbox() {
    setChatboxVisible(!isChatboxVisible())
}

setChatboxVisible(false)
messages.style.opacity = "0"
messages.style.transition = "opacity 0.3s ease"

// Interaction
const input = inputContainer.querySelector("input")
function focusInput() {
    input.focus()
}

input.addEventListener("keydown", function(event) {
    if (event.key === "Enter" || event.key === "NumpadEnter") {
        const messageText = decodeEscapeSequences(input.value)
        if (typeof Events !== "undefined") {
            Events.Call("MessageEntry", messageText)
        } else {
            addMessage(messageText, null, null)
        }
        input.value = ""
    }
})

// Refocus if visible and focus lost
input.addEventListener("blur", function() {
    if (inputContainer.style.opacity === "1") {
        input.focus()
    }
})

// Emojis panel
let emojisGroups = []
async function loadEmojisPanel() {
    const emojisContainer = document.getElementById("emojis-container")
    const emojisGrid = document.getElementById("emojis-grid")
    const emojisTabs = document.getElementById("emojis-tabs")

    if (emojisContainer.dataset.loaded === "true") {
        emojisContainer.style.opacity = "1"
        return
    }

    const groups = await fetch(`${API_URL}/groups`).then(response => response.json()).then(data => data)
    groups.forEach(async group => {
        const emojis = await fetch(`${API_URL}/groups/${group}`).then(response => response.json()).then(data => data)
        emojisGroups.push({
            name: group,
            emojis: emojis
        })

        const tab = document.createElement("button")
        tab.className = "emojis-tab"

        const tabImg = document.createElement("img")
        tabImg.src = emojis[0].url
        tab.appendChild(tabImg)
        const click = function() {
            emojisGrid.innerHTML = ""
            emojis.filter(emoji => /^[a-zA-Z0-9_]+$/.test(emoji.name)).forEach(emoji => {
                const emojiImg = document.createElement("img")
                emojiImg.src = emoji.url
                emojiImg.className = "emoji-in-grid"
                emojiImg.title = `:${emoji.name}:`
                emojisGrid.appendChild(emojiImg)

                emojiImg.addEventListener("click", function() {
                    const cursorPosition = input.selectionStart
                    const emojiText = `:${emoji.name}: `
                    input.value = input.value.slice(0, cursorPosition) + emojiText + input.value.slice(cursorPosition)
                    input.selectionStart = cursorPosition + emojiText.length
                    input.selectionEnd = cursorPosition + emojiText.length
                })
            })

            emojisTabs.querySelectorAll("button").forEach(button => {
                button.classList.remove("active")
            })
            tab.classList.add("active")
        }
        tab.addEventListener("click", click)

        if (emojisGroups.length === 1) {
            click()
        }

        emojisTabs.appendChild(tab)
    })

    emojisContainer.dataset.loaded = "true"
    emojisContainer.style.opacity = "1"
}

function openEmojisPanel() {
    const emojisContainer = document.getElementById("emojis-container")
    if (!emojisContainer.dataset.loaded) {
        loadEmojisPanel()
    }
    emojisContainer.style.opacity = "1"
}

function closeEmojisPanel() {
    const emojisContainer = document.getElementById("emojis-container")
    emojisContainer.style.opacity = "0"
}

function toggleEmojisPanel() {
    const emojisContainer = document.getElementById("emojis-container")
    if (emojisContainer.style.opacity === "1") {
        closeEmojisPanel()
    } else {
        openEmojisPanel()
    }
}

// Bind events to nanos
if (typeof Events !== "undefined") {
    Events.Subscribe("addMessage", addMessage)
    Events.Subscribe("setChatboxVisible", setChatboxVisible)
    Events.Subscribe("toggleChatbox", toggleChatbox)
    Events.Subscribe("focusInput", focusInput)

    Events.Subscribe("setTitle", (title) => {
        header.querySelector("h1").textContent = title
    })

    document.addEventListener("DOMContentLoaded", function() {
        Events.Call("Load")
    })
} else {
    setChatboxVisible(true)
}