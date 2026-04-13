const fs = require('fs');
const path = require('path');
const moment = require('moment-timezone');
const os = require('os');
const axios = require('axios');

// carregar todos os plugins
function loadAllPlugins() {
    const plugins = new Map();
    const pluginsPath = path.join(__dirname, '../plugins');
    
    if (fs.existsSync(pluginsPath)) {
        const files = fs.readdirSync(pluginsPath).filter(f => f.endsWith('.js'));
        
        for (const file of files) {
            try {
                const plugin = require(path.join(pluginsPath, file));
                if (plugin.name && plugin.execute) {
                    plugins.set(plugin.name.toLowerCase(), plugin);
                    
                    if (plugin.aliases) {
                        plugin.aliases.forEach(alias => {
                            plugins.set(alias.toLowerCase(), plugin);
                        });
                    }
                }
            } catch (error) {
                console.error(`failed to load ${file}:`, error.message);
            }
        }
    }
    
    return plugins;
}

// configuração
const config = {
    bot_name: '💧ǫᴜᴇᴇɴ ɴᴀᴢᴜᴍᴀ ᴍɪɴɪ💧',
    owner_name: 'ᴀʏᴀɴ ᴄᴏᴅᴇx',
    owner_number: '258833406646',
    prefix: '.',
    banner: 'https://files.catbox.moe/vd7maj.jpg',
    audio_url: 'https://files.catbox.moe/rdzcvr.mp3',
    newsletter_jid: '120363407904372384@newsletter',
    footer: '> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴀʏᴀɴ ᴄᴏᴅᴇx*'
};

// categorias dos comandos
const categories = {
    'general': { emoji: '🌐', name: 'general commands' },
    'downloads': { emoji: '📥', name: 'download commands' },
    'group': { emoji: '👥', name: 'group commands' },
    'fun': { emoji: '🎭', name: 'fun commands' },
    'media': { emoji: '🎨', name: 'media commands' },
    'tools': { emoji: '🔧', name: 'tools commands' },
    'owner': { emoji: '👑', name: 'owner commands' }
};

// função para pegar uptime
function getUptime() {
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    return { hours, minutes, seconds };
}

// função para gerar menu dinâmico
function generateDynamicMenu(prefix, plugins) {
    let categorizedCommands = {};
    
    for (let [cmdName, plugin] of plugins) {
        if (cmdName === plugin.name) {
            const category = plugin.category || 'general';
            if (!categorizedCommands[category]) {
                categorizedCommands[category] = [];
            }
            
            categorizedCommands[category].push({
                title: plugin.name,
                description: plugin.description || 'no description',
                id: `${prefix}${plugin.name}`
            });
        }
    }
    
    const sections = [];
    
    for (let categoryKey in categories) {
        if (categorizedCommands[categoryKey] && categorizedCommands[categoryKey].length > 0) {
            sections.push({
                title: `${categories[categoryKey].emoji} ${categories[categoryKey].name}`,
                rows: categorizedCommands[categoryKey]
            });
        }
    }
    
    return sections;
}

// função para gerar texto do menu
function generateMenuText(prefix, pushname) {
    const { hours, minutes, seconds } = getUptime();
    const totalCommands = global.plugins ? Array.from(global.plugins.keys()).filter(k => k === global.plugins.get(k)?.name).length : 0;
    const users = Object.keys(global.db?.data?.users || {}).length;
    
    const menuText = `✧ 💖 *hello, ${pushname || 'user'}!* 💖 ✧

   *💧ǫᴜᴇᴇɴ ɴᴀᴢᴜᴍᴀ ᴍɪɴɪ💧*
╭─────────────────⭓
│ • ✅ *user:* ${pushname || 'user'} 
│ • 🤖 *bot:* ǫᴜᴇᴇɴ ɴᴀᴢᴜᴍᴀ ᴍɪɴɪ
│ • 🕒 *time:* ${moment().tz('africa/kinshasa').format('hh:mm a')}
│ • 📅 *date:* ${moment().tz('africa/kinshasa').format('dd mmm yyyy')}
│ • ⏱️ *uptime:* ${hours}h ${minutes}m ${seconds}s
│ • 👥 *users:* ${users}
│ • 📚 *commands:* ${totalCommands}
│ • 💻 *platform:* ${os.platform()}
╰─────────────────⭓
© ᴀʏᴀɴ ᴄᴏᴅᴇx`;

    return menuText;
}

// função para baixar áudio
async function getBuffer(url) {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        return Buffer.from(response.data);
    } catch (error) {
        console.error('audio download error:', error);
        return null;
    }
}

// comando menu principal
module.exports = {
    name: 'menu',
    aliases: ['help', 'commands', 'cmds'],
    description: '📋 show all available commands',
    category: 'general',
    
    async execute(socket, m, args, sender, isOwner, isGroup, isSenderGroupAdmin, config, plugins) {
        try {
            await m.react('💧');
            
            // enviar audio primeiro
            try {
                const audioBuffer = await getBuffer(config.audio_url);
                if (audioBuffer) {
                    await socket.sendMessage(m.chat, {
                        audio: audioBuffer,
                        mimetype: 'audio/mpeg',
                        ptt: false
                    }, { quoted: m });
                    console.log('✅ audio sent successfully');
                }
            } catch (audioErr) {
                console.error('audio error:', audioErr);
            }
            
            const prefix = config.prefix;
            const pushname = m.pushName || m.sender.split('@')[0] || 'user';
            const banner = config.banner;
            
            const menuSections = generateDynamicMenu(prefix, plugins);
            const menuText = generateMenuText(prefix, pushname);
            
            // registrar handlers para os botões owner e ping
            if (!global.buttonHandlers) global.buttonHandlers = new Map();
            
            // handler para botão owner
            const ownerButtonId = `${prefix}owner`;
            if (!global.buttonHandlers.has(ownerButtonId)) {
                global.buttonHandlers.set(ownerButtonId, async (client, m, btnId) => {
                    await m.react('👑');
                    
                    const ownerNumber = '258833406646';
                    const botname = '💧ǫᴜᴇᴇɴ ɴᴀᴢᴜᴍᴀ ᴍɪɴɪ💧';
                    const thumbnail = 'https://files.catbox.moe/28bg4c.jpg';
                    
                    const text = `
╭─────────────────⭓
│ ✦ *owner information* ✦
│
│ 👑 creator: ᴀʏᴀɴ ᴄᴏᴅᴇx
│ 🤖 bot: ${botname}
│ 📞 contact available below
│
╰─────────────────⭓

✧ thank you for using the bot ✧`;
                    
                    const vcard = `
BEGIN:VCARD
VERSION:3.0
FN:ᴀʏᴀɴ ᴄᴏᴅᴇx
TEL;type=CELL;type=VOICE;waid=${ownerNumber}:${ownerNumber}
END:VCARD`.trim();
                    
                    await client.sendMessage(m.chat, {
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
                    
                    await client.sendMessage(m.chat, {
                        contacts: {
                            displayName: 'ᴀʏᴀɴ ᴄᴏᴅᴇx',
                            contacts: [{ vcard }]
                        }
                    }, { quoted: m });
                    
                    await m.react('✅');
                });
            }
            
            // handler para botão ping
            const pingButtonId = `${prefix}ping`;
            if (!global.buttonHandlers.has(pingButtonId)) {
                global.buttonHandlers.set(pingButtonId, async (client, m, btnId) => {
                    const start = Date.now();
                    await m.react('🏓');
                    
                    const ping = Date.now() - start;
                    
                    let badge = '🐢 slow', color = '🔴';
                    if (ping <= 150) {
                        badge = '🚀 super fast';
                        color = '🟢';
                    } else if (ping <= 300) {
                        badge = '⚡ fast';
                        color = '🟡';
                    } else if (ping <= 600) {
                        badge = '⚠️ medium';
                        color = '🟠';
                    }
                    
                    await client.sendMessage(m.chat, {
                        text: `> *💧ǫᴜᴇᴇɴ ɴᴀᴢᴜᴍᴀ ᴍɪɴɪ💧*\n> *response: ${ping} ms*\n> *status: ${color} ${badge}*\n> *version: 2.0.0*`,
                        contextInfo: {
                            mentionedJid: [m.sender],
                            forwardingScore: 999,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: '120363407904372384@newsletter',
                                newsletterName: "💧ǫᴜᴇᴇɴ ɴᴀᴢᴜᴍᴀ ᴍɪɴɪ💧",
                                serverMessageId: 143
                            }
                        }
                    }, { quoted: m });
                    
                    await m.react('✅');
                });
            }
            
            // handler para botão allmenu
            const allmenuButtonId = `${prefix}allmenu`;
            if (!global.buttonHandlers.has(allmenuButtonId)) {
                global.buttonHandlers.set(allmenuButtonId, async (client, m, btnId) => {
                    await m.react('📜');
                    
                    const prefix = config.prefix;
                    const { hours, minutes, seconds } = getUptime();
                    const totalCommands = Array.from(plugins.keys()).filter(k => k === plugins.get(k)?.name).length;
                    const users = Object.keys(global.db?.data?.users || {}).length;
                    
                    let allMenuText = `╭─────────────────⭓
│ 💧ǫᴜᴇᴇɴ ɴᴀᴢᴜᴍᴀ ᴍɪɴɪ💧
│
│ 📊 *system info*
│ 👑 owner: ᴀʏᴀɴ ᴄᴏᴅᴇx
│ 🔧 prefix: ${prefix}
│ 📦 total: ${totalCommands} commands
│ 👥 users: ${users}
│ ⏱️ uptime: ${hours}h ${minutes}m ${seconds}s
│
╰─────────────────⭓

`;
                    
                    // organizar comandos por categoria
                    let categorized = {};
                    
                    for (let [cmdName, plugin] of plugins) {
                        if (cmdName === plugin.name) {
                            const category = plugin.category || 'general';
                            if (!categorized[category]) categorized[category] = [];
                            categorized[category].push(plugin);
                        }
                    }
                    
                    // gerar lista por categoria
                    for (let categoryKey in categories) {
                        if (categorized[categoryKey] && categorized[categoryKey].length > 0) {
                            allMenuText += `\n${categories[categoryKey].emoji} *${categories[categoryKey].name}* [${categorized[categoryKey].length}]\n`;
                            allMenuText += `─────────────────⭓\n`;
                            
                            categorized[categoryKey].forEach((plugin) => {
                                const aliases = plugin.aliases && plugin.aliases.length > 0 ? ` (${plugin.aliases.join(', ')})` : '';
                                allMenuText += `│ 💧 ${prefix}${plugin.name}${aliases}\n`;
                                allMenuText += `│    ↳ ${plugin.description}\n`;
                            });
                            
                            allMenuText += `─────────────────⭓\n`;
                        }
                    }
                    
                    allMenuText += `\n> ${config.footer}`;
                    
                    // se for muito grande, dividir em partes
                    if (allMenuText.length > 4096) {
                        const parts = [];
                        let currentPart = '';
                        const lines = allMenuText.split('\n');
                        
                        for (const line of lines) {
                            if ((currentPart + line + '\n').length > 4000) {
                                parts.push(currentPart);
                                currentPart = line + '\n';
                            } else {
                                currentPart += line + '\n';
                            }
                        }
                        if (currentPart) parts.push(currentPart);
                        
                        for (let i = 0; i < parts.length; i++) {
                            await client.sendMessage(m.chat, { text: parts[i] }, { quoted: m });
                        }
                    } else {
                        await client.sendMessage(m.chat, { text: allMenuText }, { quoted: m });
                    }
                    
                    await m.react('✅');
                });
            }
            
            const buttons = [
                {
                    buttonId: `${prefix}menu_interactive`,
                    buttonText: { displayText: '📋 ᴏᴘᴇɴ ɪɴᴛᴇʀᴀᴄᴛɪᴠᴇ ᴍᴇɴᴜ' },
                    type: 4,
                    nativeFlowInfo: {
                        name: 'single_select',
                        paramsJson: JSON.stringify({
                            title: '💧ǫᴜᴇᴇɴ ɴᴀᴢᴜᴍᴀ ᴍɪɴɪ💧 - ᴄᴏᴍᴍᴀɴᴅ ᴍᴇɴᴜ',
                            sections: menuSections
                        })
                    }
                },
                {
                    buttonId: ownerButtonId,
                    buttonText: { displayText: '👑 ᴏᴡɴᴇʀ' },
                    type: 1
                },
                {
                    buttonId: pingButtonId,
                    buttonText: { displayText: '🏓 ᴘɪɴɢ' },
                    type: 1
                },
                {
                    buttonId: allmenuButtonId,
                    buttonText: { displayText: '📜 ᴀʟʟ ᴄᴏᴍᴍᴀɴᴅs' },
                    type: 1
                }
            ];
            
            // enviar o menu com imagem
            await socket.sendMessage(m.chat, {
                image: { url: banner },
                caption: menuText,
                footer: config.footer,
                buttons: buttons,
                headerType: 1
            }, { quoted: m });
            
            await m.react('✅');
            
        } catch (error) {
            console.error('menu error:', error);
            
            // menu simples em caso de erro
            let simpleMenu = `💧 *ǫᴜᴇᴇɴ ɴᴀᴢᴜᴍᴀ ᴍɪɴɪ* 💧\n\n✨ hello ${m.pushName || 'user'}! ✨\n\n📚 total commands: ${Array.from(plugins.keys()).filter(k => k === plugins.get(k)?.name).length}\n🕐 time: ${moment().tz('africa/kinshasa').format('dd/mm/yyyy hh:mm')}\n\n💡 use .allmenu to see all commands\n\n© ᴀʏᴀɴ ᴄᴏᴅᴇx`;
            
            await socket.sendMessage(m.chat, { text: simpleMenu }, { quoted: m });
        }
    }
};

// menu interativo
module.exports.interactiveMenu = {
    name: 'menu_interactive',
    aliases: ['interactive'],
    description: '📋 open interactive command menu',
    category: 'general',
    
    async execute(socket, m, args, sender, isOwner, isGroup, isSenderGroupAdmin, config, plugins) {
        try {
            const prefix = config.prefix;
            const menuSections = generateDynamicMenu(prefix, plugins);
            
            const buttons = [
                {
                    buttonId: `${prefix}menu`,
                    buttonText: { displayText: '🔙 ʙᴀᴄᴋ ᴛᴏ ᴍᴇɴᴜ' },
                    type: 4,
                    nativeFlowInfo: {
                        name: 'single_select',
                        paramsJson: JSON.stringify({
                            title: '💧ǫᴜᴇᴇɴ ɴᴀᴢᴜᴍᴀ ᴍɪɴɪ💧 - ᴄᴏᴍᴍᴀɴᴅ ᴍᴇɴᴜ',
                            sections: menuSections
                        })
                    }
                }
            ];
            
            await socket.sendMessage(m.chat, {
                text: `💧 *ǫᴜᴇᴇɴ ɴᴀᴢᴜᴍᴀ ᴍɪɴɪ* 💧\n\n✨ sᴇʟᴇᴄᴛ ᴀ ᴄᴀᴛᴇɢᴏʀʏ ᴛᴏ sᴇᴇ ᴄᴏᴍᴍᴀɴᴅs ✨\n\n> ${config.footer}`,
                buttons: buttons,
                headerType: 1
            }, { quoted: m });
            
        } catch (error) {
            console.error('interactive menu error:', error);
            await m.reply(`❌ *error:*\n\n${error.message}\n\n💧 *ǫᴜᴇᴇɴ ɴᴀᴢᴜᴍᴀ ᴍɪɴɪ* 💧`);
        }
    }
};