// msg.js - Updated with full button support
const {
    proto,
    downloadContentFromMessage,
    getContentType
} = require('shamika-wa-baileys')
const fs = require('fs')

const downloadMediaMessage = async (m, filename) => {
    if (m.type === 'viewOnceMessage') {
        m.type = m.msg.type
    }
    if (m.type === 'imageMessage') {
        var nameJpg = filename ? filename + '.jpg' : 'undefined.jpg'
        const stream = await downloadContentFromMessage(m.msg, 'image')
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }
        fs.writeFileSync(nameJpg, buffer)
        return fs.readFileSync(nameJpg)
    } else if (m.type === 'videoMessage') {
        var nameMp4 = filename ? filename + '.mp4' : 'undefined.mp4'
        const stream = await downloadContentFromMessage(m.msg, 'video')
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }
        fs.writeFileSync(nameMp4, buffer)
        return fs.readFileSync(nameMp4)
    } else if (m.type === 'audioMessage') {
        var nameMp3 = filename ? filename + '.mp3' : 'undefined.mp3'
        const stream = await downloadContentFromMessage(m.msg, 'audio')
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }
        fs.writeFileSync(nameMp3, buffer)
        return fs.readFileSync(nameMp3)
    } else if (m.type === 'stickerMessage') {
        var nameWebp = filename ? filename + '.webp' : 'undefined.webp'
        const stream = await downloadContentFromMessage(m.msg, 'sticker')
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }
        fs.writeFileSync(nameWebp, buffer)
        return fs.readFileSync(nameWebp)
    } else if (m.type === 'documentMessage') {
        var ext = m.msg.fileName.split('.')[1].toLowerCase().replace('jpeg', 'jpg').replace('png', 'jpg').replace('m4a', 'mp3')
        var nameDoc = filename ? filename + '.' + ext : 'undefined.' + ext
        const stream = await downloadContentFromMessage(m.msg, 'document')
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }
        fs.writeFileSync(nameDoc, buffer)
        return fs.readFileSync(nameDoc)
    }
}

// Button Builder Class
class ButtonBuilder {
    constructor() {
        this.buttons = []
    }

    // Type 1: Quick Reply Button
    addQuickReplyButton(id, displayText) {
        this.buttons.push({
            buttonId: id,
            buttonText: { displayText: displayText },
            type: 1
        })
        return this
    }

    // Type 4: Interactive/CTA Button
    addInteractiveButton(id, displayText) {
        this.buttons.push({
            buttonId: id,
            buttonText: { displayText: displayText },
            type: 4
        })
        return this
    }

    // Template Button with URL
    addUrlButton(displayText, url) {
        this.buttons.push({
            buttonId: 'url',
            buttonText: { displayText: displayText },
            type: 1,
            url: url
        })
        return this
    }

    // Call Button
    addCallButton(displayText, phoneNumber) {
        this.buttons.push({
            buttonId: 'call',
            buttonText: { displayText: displayText },
            type: 1,
            phoneNumber: phoneNumber
        })
        return this
    }

    build() {
        return this.buttons
    }
}

// List Section Builder
class ListSectionBuilder {
    constructor(title) {
        this.title = title
        this.rows = []
    }

    addRow(title, description, id) {
        this.rows.push({
            title: title,
            description: description,
            rowId: id
        })
        return this
    }

    build() {
        return {
            title: this.title,
            rows: this.rows
        }
    }
}

// List Message Builder
class ListMessageBuilder {
    constructor() {
        this.sections = []
        this.buttonText = 'Menu'
        this.title = 'Select an option'
        this.description = 'Choose from the list below'
        this.footerText = ''
    }

    setButtonText(text) {
        this.buttonText = text
        return this
    }

    setTitle(title) {
        this.title = title
        return this
    }

    setDescription(description) {
        this.description = description
        return this
    }

    setFooter(footer) {
        this.footerText = footer
        return this
    }

    addSection(section) {
        this.sections.push(section.build())
        return this
    }

    build() {
        return {
            buttonText: this.buttonText,
            title: this.title,
            description: this.description,
            sections: this.sections,
            footerText: this.footerText,
            listType: 1
        }
    }
}

// Template Button Builder
class TemplateButtonBuilder {
    constructor() {
        this.buttons = []
    }

    // Quick Reply Template Button
    addQuickReplyTemplateButton(id, displayText) {
        this.buttons.push({
            index: this.buttons.length,
            quickReplyButton: {
                displayText: displayText,
                id: id
            }
        })
        return this
    }

    // URL Template Button
    addUrlTemplateButton(displayText, url) {
        this.buttons.push({
            index: this.buttons.length,
            urlButton: {
                displayText: displayText,
                url: url
            }
        })
        return this
    }

    // Call Template Button
    addCallTemplateButton(displayText, phoneNumber) {
        this.buttons.push({
            index: this.buttons.length,
            callButton: {
                displayText: displayText,
                phoneNumber: phoneNumber
            }
        })
        return this
    }

    build() {
        return this.buttons
    }
}

// Interactive Message Builder (Type 4 with native flow)
class InteractiveMessageBuilder {
    constructor() {
        this.buttons = []
        this.headerText = ''
        this.bodyText = ''
        this.footerText = ''
    }

    setHeader(text) {
        this.headerText = text
        return this
    }

    setBody(text) {
        this.bodyText = text
        return this
    }

    setFooter(text) {
        this.footerText = text
        return this
    }

    addNativeFlowButton(id, displayText, sections) {
        this.buttons.push({
            name: 'single_select',
            buttonParamsJson: JSON.stringify({
                title: displayText,
                sections: sections
            })
        })
        return this
    }

    async send(socket, jid, options = {}) {
        const message = {
            text: this.bodyText,
            footer: this.footerText,
            header: this.headerText,
            interactiveButtons: this.buttons
        }
        
        if (options.quoted) {
            return await socket.sendMessage(jid, message, { quoted: options.quoted })
        }
        return await socket.sendMessage(jid, message)
    }
}

// Button Template Message Builder
class ButtonTemplateBuilder {
    constructor() {
        this.buttons = []
        this.text = ''
        this.footer = ''
    }

    setText(text) {
        this.text = text
        return this
    }

    setFooter(footer) {
        this.footer = footer
        return this
    }

    addButton(id, displayText) {
        this.buttons.push({
            buttonId: id,
            buttonText: { displayText: displayText },
            type: 1
        })
        return this
    }

    async send(socket, jid, options = {}) {
        const message = {
            text: this.text,
            footer: this.footer,
            buttons: this.buttons,
            headerType: 1
        }
        
        if (options.image) {
            message.image = options.image
        }
        if (options.video) {
            message.video = options.video
        }
        
        if (options.quoted) {
            return await socket.sendMessage(jid, message, { quoted: options.quoted })
        }
        return await socket.sendMessage(jid, message)
    }
}

// Carousel Message Builder (for multiple products/messages)
class CarouselBuilder {
    constructor() {
        this.cards = []
    }

    addCard(title, description, imageUrl, buttons) {
        this.cards.push({
            title: title,
            description: description,
            image: { url: imageUrl },
            buttons: buttons
        })
        return this
    }

    async send(socket, jid, options = {}) {
        const message = {
            carouselMessage: {
                cards: this.cards
            }
        }
        
        if (options.quoted) {
            return await socket.sendMessage(jid, message, { quoted: options.quoted })
        }
        return await socket.sendMessage(jid, message)
    }
}

const sms = (conn, m) => {
    if (m.key) {
        m.id = m.key.id
        m.chat = m.key.remoteJid
        m.fromMe = m.key.fromMe
        m.isGroup = m.chat.endsWith('@g.us')
        m.sender = m.fromMe ? conn.user.id.split(':')[0] + '@s.whatsapp.net' : m.isGroup ? m.key.participant : m.key.remoteJid
    }
    if (m.message) {
        m.type = getContentType(m.message)
        m.msg = (m.type === 'viewOnceMessage') ? m.message[m.type].message[getContentType(m.message[m.type].message)] : m.message[m.type]
        if (m.msg) {
            if (m.type === 'viewOnceMessage') {
                m.msg.type = getContentType(m.message[m.type].message)
            }
            var quotedMention = m.msg.contextInfo != null ? m.msg.contextInfo.participant : ''
            var tagMention = m.msg.contextInfo != null ? m.msg.contextInfo.mentionedJid : []
            var mention = typeof(tagMention) == 'string' ? [tagMention] : tagMention
            mention != undefined ? mention.push(quotedMention) : []
            m.mentionUser = mention != undefined ? mention.filter(x => x) : []
            m.body = (m.type === 'conversation') ? m.msg : (m.type === 'extendedTextMessage') ? m.msg.text : (m.type == 'imageMessage') && m.msg.caption ? m.msg.caption : (m.type == 'videoMessage') && m.msg.caption ? m.msg.caption : (m.type == 'templateButtonReplyMessage') && m.msg.selectedId ? m.msg.selectedId : (m.type == 'buttonsResponseMessage') && m.msg.selectedButtonId ? m.msg.selectedButtonId : ''
            m.quoted = m.msg.contextInfo != undefined ? m.msg.contextInfo.quotedMessage : null
            if (m.quoted) {
                m.quoted.type = getContentType(m.quoted)
                m.quoted.id = m.msg.contextInfo.stanzaId
                m.quoted.sender = m.msg.contextInfo.participant
                m.quoted.fromMe = m.quoted.sender.split('@')[0].includes(conn.user.id.split(':')[0])
                m.quoted.msg = (m.quoted.type === 'viewOnceMessage') ? m.quoted[m.quoted.type].message[getContentType(m.quoted[m.quoted.type].message)] : m.quoted[m.quoted.type]
                if (m.quoted.type === 'viewOnceMessage') {
                    m.quoted.msg.type = getContentType(m.quoted[m.quoted.type].message)
                }
                var quoted_quotedMention = m.quoted.msg.contextInfo != null ? m.quoted.msg.contextInfo.participant : ''
                var quoted_tagMention = m.quoted.msg.contextInfo != null ? m.quoted.msg.contextInfo.mentionedJid : []
                var quoted_mention = typeof(quoted_tagMention) == 'string' ? [quoted_tagMention] : quoted_tagMention
                quoted_mention != undefined ? quoted_mention.push(quoted_quotedMention) : []
                m.quoted.mentionUser = quoted_mention != undefined ? quoted_mention.filter(x => x) : []
                m.quoted.fakeObj = proto.WebMessageInfo.fromObject({
                    key: {
                        remoteJid: m.chat,
                        fromMe: m.quoted.fromMe,
                        id: m.quoted.id,
                        participant: m.quoted.sender
                    },
                    message: m.quoted
                })
                m.quoted.download = (filename) => downloadMediaMessage(m.quoted, filename)
                m.quoted.delete = () => conn.sendMessage(m.chat, {
                    delete: m.quoted.fakeObj.key
                })
                m.quoted.react = (emoji) => conn.sendMessage(m.chat, {
                    react: {
                        text: emoji,
                        key: m.quoted.fakeObj.key
                    }
                })
            }
        }
        m.download = (filename) => downloadMediaMessage(m, filename)
    }

    // Helper method to send quick reply buttons (Type 1)
    m.sendQuickButtons = async (text, buttons, options = {}) => {
        const buttonList = buttons.map(btn => ({
            buttonId: btn.id,
            buttonText: { displayText: btn.text },
            type: 1
        }))
        
        const message = {
            text: text,
            buttons: buttonList,
            headerType: 1
        }
        
        if (options.image) message.image = options.image
        if (options.video) message.video = options.video
        if (options.footer) message.footer = options.footer
        
        return await conn.sendMessage(m.chat, message, { quoted: m, ...options })
    }

    // Helper method to send interactive buttons (Type 4)
    m.sendInteractiveButtons = async (text, buttons, options = {}) => {
        const buttonList = buttons.map(btn => ({
            buttonId: btn.id,
            buttonText: { displayText: btn.text },
            type: 4
        }))
        
        const message = {
            text: text,
            buttons: buttonList,
            headerType: 1
        }
        
        if (options.image) message.image = options.image
        if (options.video) message.video = options.video
        if (options.footer) message.footer = options.footer
        
        return await conn.sendMessage(m.chat, message, { quoted: m, ...options })
    }

    // Helper method to send list message
    m.sendListMessage = async (title, description, buttonText, sections, options = {}) => {
        const sectionsFormatted = sections.map(section => ({
            title: section.title,
            rows: section.rows.map(row => ({
                title: row.title,
                description: row.description,
                rowId: row.id
            }))
        }))
        
        const message = {
            text: description,
            footer: options.footer || '',
            title: title,
            buttonText: buttonText,
            sections: sectionsFormatted,
            listType: 1
        }
        
        return await conn.sendMessage(m.chat, message, { quoted: m, ...options })
    }

    // Helper method to send template buttons
    m.sendTemplateButtons = async (text, buttons, options = {}) => {
        const templateButtons = buttons.map((btn, idx) => {
            if (btn.url) {
                return {
                    index: idx,
                    urlButton: {
                        displayText: btn.text,
                        url: btn.url
                    }
                }
            } else if (btn.phoneNumber) {
                return {
                    index: idx,
                    callButton: {
                        displayText: btn.text,
                        phoneNumber: btn.phoneNumber
                    }
                }
            } else {
                return {
                    index: idx,
                    quickReplyButton: {
                        displayText: btn.text,
                        id: btn.id
                    }
                }
            }
        })
        
        const message = {
            text: text,
            footer: options.footer || '',
            templateButtons: templateButtons,
            headerType: 1
        }
        
        if (options.image) message.image = options.image
        if (options.video) message.video = options.video
        
        return await conn.sendMessage(m.chat, message, { quoted: m, ...options })
    }

    // Helper method to send native flow interactive message
    m.sendNativeFlow = async (title, sections, options = {}) => {
        const message = {
            interactiveMessage: {
                body: { text: options.body || 'Select an option' },
                footer: { text: options.footer || '' },
                header: { title: title, hasMedia: false },
                nativeFlowMessage: {
                    buttons: [
                        {
                            name: 'single_select',
                            buttonParamsJson: JSON.stringify({
                                title: title,
                                sections: sections
                            })
                        }
                    ]
                }
            }
        }
        
        return await conn.sendMessage(m.chat, message, { quoted: m, ...options })
    }

    // Helper method to send button template with image
    m.sendImageWithButtons = async (imageUrl, caption, buttons, options = {}) => {
        const buttonList = buttons.map(btn => ({
            buttonId: btn.id,
            buttonText: { displayText: btn.text },
            type: 1
        }))
        
        const message = {
            image: { url: imageUrl },
            caption: caption,
            buttons: buttonList,
            headerType: 1
        }
        
        if (options.footer) message.footer = options.footer
        
        return await conn.sendMessage(m.chat, message, { quoted: m, ...options })
    }

    // Helper method to send product carousel
    m.sendCarousel = async (cards, options = {}) => {
        const carouselCards = cards.map(card => ({
            productMessage: {
                product: {
                    productImage: { url: card.image },
                    title: card.title,
                    description: card.description,
                    currencyCode: 'USD',
                    priceAmount1000: (card.price || 0) * 1000,
                    retailerId: card.id || '1',
                    url: card.url || ''
                },
                buttons: card.buttons.map(btn => ({
                    buttonId: btn.id,
                    buttonText: { displayText: btn.text },
                    type: 1
                }))
            }
        }))
        
        const message = {
            carouselMessage: {
                cards: carouselCards
            }
        }
        
        return await conn.sendMessage(m.chat, message, { quoted: m, ...options })
    }

    // Original reply methods
    m.reply = (teks, id = m.chat, option = {
        mentions: [m.sender]
    }) => conn.sendMessage(id, {
        text: teks,
        contextInfo: {
            mentionedJid: option.mentions
        }
    }, {
        quoted: m
    })
    
    m.replyS = (stik, id = m.chat, option = {
        mentions: [m.sender]
    }) => conn.sendMessage(id, {
        sticker: stik,
        contextInfo: {
            mentionedJid: option.mentions
        }
    }, {
        quoted: m
    })
    
    m.replyImg = (img, teks, id = m.chat, option = {
        mentions: [m.sender]
    }) => conn.sendMessage(id, {
        image: img,
        caption: teks,
        contextInfo: {
            mentionedJid: option.mentions
        }
    }, {
        quoted: m
    })
    
    m.replyVid = (vid, teks, id = m.chat, option = {
        mentions: [m.sender],
        gif: false
    }) => conn.sendMessage(id, {
        video: vid,
        caption: teks,
        gifPlayback: option.gif,
        contextInfo: {
            mentionedJid: option.mentions
        }
    }, {
        quoted: m
    })
    
    m.replyAud = (aud, id = m.chat, option = {
        mentions: [m.sender],
        ptt: false
    }) => conn.sendMessage(id, {
        audio: aud,
        ptt: option.ptt,
        mimetype: 'audio/mpeg',
        contextInfo: {
            mentionedJid: option.mentions
        }
    }, {
        quoted: m
    })
    
    m.replyDoc = (doc, id = m.chat, option = {
        mentions: [m.sender],
        filename: 'undefined.pdf',
        mimetype: 'application/pdf'
    }) => conn.sendMessage(id, {
        document: doc,
        mimetype: option.mimetype,
        fileName: option.filename,
        contextInfo: {
            mentionedJid: option.mentions
        }
    }, {
        quoted: m
    })
    
    m.replyContact = (name, info, number) => {
        var vcard = 'BEGIN:VCARD\n' + 'VERSION:3.0\n' + 'FN:' + name + '\n' + 'ORG:' + info + ';\n' + 'TEL;type=CELL;type=VOICE;waid=' + number + ':+' + number + '\n' + 'END:VCARD'
        conn.sendMessage(m.chat, {
            contacts: {
                displayName: name,
                contacts: [{
                    vcard
                }]
            }
        }, {
            quoted: m
        })
    }
    
    m.react = (emoji) => conn.sendMessage(m.chat, {
        react: {
            text: emoji,
            key: m.key
        }
    })

    return m
}

module.exports = {
    sms,
    downloadMediaMessage,
    ButtonBuilder,
    ListSectionBuilder,
    ListMessageBuilder,
    TemplateButtonBuilder,
    InteractiveMessageBuilder,
    ButtonTemplateBuilder,
    CarouselBuilder
}