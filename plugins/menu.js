module.exports = {
    name: 'menu',
    aliases: ['help', 'commands'],
    description: 'Show all commands',
    category: 'general',
    
    async execute(socket, m, args, sender, isOwner, isGroup, isSenderGroupAdmin, config, plugins) {
        await socket.sendMessage(sender, { react: { text: '📋', key: m.key } });
        
        // Organize commands by category
        const categories = new Map();
        
        for (const [cmdName, plugin] of plugins) {
            if (cmdName === plugin.name) { // Only add once per plugin
                const category = plugin.category || 'general';
                if (!categories.has(category)) {
                    categories.set(category, []);
                }
                categories.get(category).push(plugin);
            }
        }
        
        // Define category display names and icons
        const categoryIcons = {
            'general': '🌐',
            'downloads': '📥',
            'group': '👥',
            'fun': '🎭',
            'media': '🎨',
            'tools': '🔧',
            'owner': '👑'
        };
        
        const categoryNames = {
            'general': 'Gᴇɴᴇʀᴀʟ',
            'downloads': 'Dᴏᴡɴʟᴏᴀᴅs',
            'group': 'Gʀᴏᴜᴘ Mᴀɴᴀɢᴇᴍᴇɴᴛ',
            'fun': 'Fᴜɴ & Eɴᴛᴇʀᴛᴀɪɴᴍᴇɴᴛ',
            'media': 'Mᴇᴅɪᴀ Tᴏᴏʟs',
            'tools': 'Tᴏᴏʟs & Uᴛɪʟɪᴛɪᴇs',
            'owner': 'Oᴡɴᴇʀ Oɴʟʏ'
        };
        
        // Build sections for list message dynamically
        const sections = [];
        
        for (const [category, cmdList] of categories) {
            const rows = [];
            for (const plugin of cmdList) {
                rows.push({
                    title: `${plugin.name.charAt(0).toUpperCase() + plugin.name.slice(1)}`,
                    description: plugin.description || 'No description',
                    rowId: `${config.PREFIX}${plugin.name}`
                });
            }
            
            sections.push({
                title: `${categoryIcons[category] || '📁'} ${categoryNames[category] || category.toUpperCase()}`,
                rows: rows
            });
        }
        
        // Send as List Message
        await socket.sendMessage(sender, {
            text: `╭───────────────⭓
│  💧ǫᴜᴇᴇɴ ɴᴀᴢᴜᴍᴀ ᴍɪɴɪ💧
│
│  📋 *Cᴏᴍᴍᴀɴᴅ Mᴇɴᴜ*
│  📌 Total: ${Array.from(plugins.keys()).filter(k => k === plugins.get(k)?.name).length} commands
│
╰───────────────⭓

> Sᴇʟᴇᴄᴛ ᴀ ᴄᴀᴛᴇɢᴏʀʏ ʙᴇʟᴏᴡ

> ${config.FOOTER}`,
            footer: config.FOOTER,
            title: '💧 Qᴜᴇᴇɴ Nᴀᴢᴜᴍᴀ Mɪɴɪ',
            buttonText: '📋 Vɪᴇᴡ Cᴏᴍᴍᴀɴᴅs',
            sections: sections,
            listType: 1
        }, { quoted: m });
        
        // Also send interactive buttons for main categories (Type 4)
        const categoryButtons = [];
        for (const [category] of categories) {
            categoryButtons.push({
                buttonId: `${config.PREFIX}cat_${category}`,
                buttonText: { displayText: `${categoryIcons[category] || '📁'} ${categoryNames[category] || category}` },
                type: 4
            });
        }
        
        await socket.sendMessage(sender, {
            text: `╭───────────────⭓
│  💧ǫᴜᴇᴇɴ ɴᴀᴢᴜᴍᴀ ᴍɪɴɪ💧
│
│  🚀 *Qᴜɪᴄᴋ Cᴀᴛᴇɢᴏʀɪᴇs*
│
╰───────────────⭓

> Cʟɪᴄᴋ ᴏɴ ᴀ ᴄᴀᴛᴇɢᴏʀʏ ᴛᴏ ᴠɪᴇᴡ ᴄᴏᴍᴍᴀɴᴅs`,
            buttons: categoryButtons,
            headerType: 1
        }, { quoted: m });
    }
}