module.exports = {
    name: 'ping',
    aliases: ['latency', 'speed'],
    description: 'Check bot latency',
    category: 'general',
    
    async execute(socket, m, args, sender, isOwner, isGroup, isSenderGroupAdmin, config) {
        await socket.sendMessage(sender, { react: { text: '🏓', key: m.key } });
        
        const start = Date.now();
        await socket.sendMessage(sender, { text: '💧 Cʜᴇᴄᴋɪɴɢ ᴄᴏɴɴᴇᴄᴛɪᴏɴ...' }, { quoted: m });
        const end = Date.now();
        const latency = end - start;
        
        let quality = '';
        let emoji = '';
        if (latency < 100) { quality = 'Exᴄᴇʟʟᴇɴᴛ'; emoji = '🟢'; }
        else if (latency < 300) { quality = 'Gᴏᴏᴅ'; emoji = '🟡'; }
        else if (latency < 600) { quality = 'Fᴀɪʀ'; emoji = '🟠'; }
        else { quality = 'Pᴏᴏʀ'; emoji = '🔴'; }
        
        const text = `╭───────────────⭓
│  💧ǫᴜᴇᴇɴ ɴᴀᴢᴜᴍᴀ ᴍɪɴɪ💧
│
│  🏓 *Pɪɴɢ Rᴇsᴜʟᴛs*
│  ⚡ Sᴘᴇᴇᴅ: ${latency}ms
│  ${emoji} Qᴜᴀʟɪᴛʏ: ${quality}
│
╰───────────────⭓

> ${config.FOOTER}`;

        // Template Buttons
        const templateButtons = [
            { id: `${config.PREFIX}alive`, text: '💧 Aʟɪᴠᴇ' },
            { id: `${config.PREFIX}menu`, text: '📋 Mᴇɴᴜ' },
            { text: '📢 Cʜᴀɴɴᴇʟ', url: config.CHANNEL_LINK },
            { text: '👥 Gʀᴏᴜᴘ', phoneNumber: config.OWNER_NUMBER }
        ];
        
        await socket.sendTemplateButtons(text, templateButtons, { quoted: m });
    }
}