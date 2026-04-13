// plugins/owner.js
module.exports = {
    name: 'owner',
    aliases: ['creator', 'dev', 'support'],
    description: 'show bot owner information',
    category: 'general',
    
    async execute(socket, m, args, sender, isOwner, isGroup, isSenderGroupAdmin, config, plugins) {
        await socket.sendMessage(sender, { react: { text: '👑', key: m.key } });
        
        const ownerNumber = '258833406646';
        const botname = '💧ǫᴜᴇᴇɴ ɴᴀᴢᴜᴍᴀ ᴍɪɴɪ💧';
        const thumbnail = 'https://files.catbox.moe/vd7maj.jpg';
        
        const text = `
╭━〔˚୨•(=^●ω●^=)• ⊹ ᴄʀᴇᴀᴛᴏʀ ⊹〕━╮

» ˚୨•(=^●ω●^=)• ⊹ ɪɴꜰᴏʀᴍᴀᴛɪᴏɴ ⊹

➤ ᴄʀᴇᴀᴛᴏʀ: ᴀʏᴀɴ ᴄᴏᴅᴇx
➤ ʙᴏᴛ: ${botname}
➤ ᴄᴏɴᴛᴀᴄᴛ ᴀᴠᴀɪʟᴀʙʟᴇ ʙᴇʟᴏᴡ

──────────────

✧ ᴛʜᴀɴᴋ ʏᴏᴜ ꜰᴏʀ ᴜꜱɪɴɢ ᴛʜᴇ ʙᴏᴛ ✧

╰━━━━━━━━━━━━━━━━━━━━╯`.trim();
        
        const vcard = `
BEGIN:VCARD
VERSION:3.0
FN:ᴀʏᴀɴ ᴄᴏᴅᴇx
TEL;type=CELL;type=VOICE;waid=${ownerNumber}:${ownerNumber}
END:VCARD`.trim();
        
        await socket.sendMessage(m.chat, {
            text: text,
            contextInfo: {
                externalAdReply: {
                    title: 'ʙᴏᴛ ᴄʀᴇᴀᴛᴏʀ',
                    body: botname,
                    thumbnailUrl: thumbnail,
                    mediaType: 1,
                    renderLargerThumbnail: true,
                    showAdAttribution: false
                }
            }
        }, { quoted: m });
        
        await socket.sendMessage(m.chat, {
            contacts: {
                displayName: 'ᴀʏᴀɴ ᴄᴏᴅᴇx',
                contacts: [{ vcard }]
            }
        }, { quoted: m });
        
        await socket.sendMessage(sender, { react: { text: '✅', key: m.key } });
    }
};