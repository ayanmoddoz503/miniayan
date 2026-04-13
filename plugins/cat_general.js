module.exports = {
    name: 'cat_general',
    aliases: [],
    description: 'Show general commands',
    category: 'general',
    
    async execute(socket, m, args, sender, isOwner, isGroup, isSenderGroupAdmin, config, plugins) {
        const generalCommands = [];
        
        for (const [cmdName, plugin] of plugins) {
            if (cmdName === plugin.name && plugin.category === 'general') {
                generalCommands.push(plugin);
            }
        }
        
        let text = `╭───────────────⭓
│  💧ǫᴜᴇᴇɴ ɴᴀᴢᴜᴍᴀ ᴍɪɴɪ💧
│
│  🌐 *Gᴇɴᴇʀᴀʟ Cᴏᴍᴍᴀɴᴅs*
│
`;
        for (const cmd of generalCommands) {
            text += `│  💧 ${config.PREFIX}${cmd.name}\n`;
            text += `│     └─ ${cmd.description}\n`;
        }
        
        text += `│
╰───────────────⭓

> ${config.FOOTER}`;
        
        // Quick Reply Buttons
        const buttons = [];
        for (const cmd of generalCommands.slice(0, 5)) {
            buttons.push({
                buttonId: `${config.PREFIX}${cmd.name}`,
                buttonText: { displayText: `💧 ${cmd.name}` },
                type: 1
            });
        }
        
        await socket.sendMessage(sender, {
            image: { url: config.BOT_IMAGE },
            caption: text,
            buttons: buttons,
            headerType: 1
        }, { quoted: m });
    }
}