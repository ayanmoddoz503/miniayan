// plugins/menu.js
const fs = require('fs');
const path = require('path');
const moment = require('moment-timezone');
const os = require('os');
const axios = require('axios');

const audio_url = 'https://files.catbox.moe/rdzcvr.mp3';

async function getBuffer(url) {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 30000 });
        return Buffer.from(response.data);
    } catch (error) {
        console.error('audio download error:', error);
        return null;
    }
}

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
function generateMenuText(prefix, pushname, plugins) {
    const { hours, minutes, seconds } = getUptime();
    const totalCommands = Array.from(plugins.keys()).filter(k => k === plugins.get(k)?.name).length;
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

module.exports = {
    name: 'menu',
    aliases: ['help', 'commands', 'cmds'],
    description: '📋 show all available commands',
    category: 'general',
    
    async execute(socket, m, args, sender, isOwner, isGroup, isSenderGroupAdmin, config, plugins) {
        try {
            await socket.sendMessage(sender, { react: { text: '💧', key: m.key } });
            
            // enviar audio primeiro
            try {
                const audioBuffer = await getBuffer(audio_url);
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
            const menuText = generateMenuText(prefix, pushname, plugins);
            
            // registrar handlers para os botões
            if (!global.buttonHandlers) global.buttonHandlers = new Map();
            
            // handler para botão owner
            const ownerButtonId = `${prefix}owner`;
            if (!global.buttonHandlers.has(ownerButtonId)) {
                global.buttonHandlers.set(ownerButtonId, async (client, msg, btnId) => {
                    await msg.react('👑');
                    
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
                    
                    await client.sendMessage(msg.chat, {
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
                    }, { quoted: msg });
                    
                    await client.sendMessage(msg.chat, {
                        contacts: {
                            displayName: 'ᴀʏᴀɴ ᴄᴏᴅᴇx',
                            contacts: [{ vcard }]
                        }
                    }, { quoted: msg });
                    
                    await msg.react('✅');
                });
            }
            
            // handler para botão ping
            const pingButtonId = `${prefix}ping`;
            if (!global.buttonHandlers.has(pingButtonId)) {
                global.buttonHandlers.set(pingButtonId, async (client, msg, btnId) => {
                    const start = Date.now();
                    await msg.react('🏓');
                    
                    const ping = Date.now() - start;
                    
                    let badge = '🐢 sʟᴏᴡ', color = '🔴';
                    if (ping <= 150) {
                        badge = '🚀 sᴜᴘᴇʀ ꜰᴀꜱᴛ';
                        color = '🟢';
                    } else if (ping <= 300) {
                        badge = '⚡ ꜰᴀꜱᴛ';
                        color = '🟡';
                    } else if (ping <= 600) {
                        badge = '⚠️ ᴍᴇᴅɪᴜᴍ';
                        color = '🟠';
                    }
                    
                    await client.sendMessage(msg.chat, {
                        text: `> *💧ǫᴜᴇᴇɴ ɴᴀᴢᴜᴍᴀ ᴍɪɴɪ💧*\n> *ʀᴇꜱᴘᴏɴꜱᴇ:* ${ping} ms\n> *ꜱᴛᴀᴛᴜꜱ:* ${color} ${badge}\n> *ᴠᴇʀꜱɪᴏɴ:* 2.0.0`,
                        contextInfo: {
                            mentionedJid: [msg.sender],
                            forwardingScore: 999,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: '120363407904372384@newsletter',
                                newsletterName: "💧 ǫᴜᴇᴇɴ ɴᴀᴢᴜᴍᴀ ᴍɪɴɪ 💧",
                                serverMessageId: 143
                            }
                        }
                    }, { quoted: msg });
                    
                    await msg.react('✅');
                });
            }
            
            // handler para botão allmenu
            const allmenuButtonId = `${prefix}allmenu`;
            if (!global.buttonHandlers.has(allmenuButtonId)) {
                global.buttonHandlers.set(allmenuButtonId, async (client, msg, btnId) => {
                    await msg.react('📜');
                    
                    const prefix = config.prefix;
                    const { hours, minutes, seconds } = getUptime();
                    const totalCommands = Array.from(plugins.keys()).filter(k => k === plugins.get(k)?.name).length;
                    const users = Object.keys(global.db?.data?.users || {}).length;
                    
                    let allMenuText = `╭─────────────────⭓
│ 💧ǫᴜᴇᴇɴ ɴᴀᴢᴜᴍᴀ ᴍɪɴɪ💧
│
│ 📊 *ꜱʏꜱᴛᴇᴍ ɪɴꜰᴏ*
│ 👑 ᴏᴡɴᴇʀ: ᴀʏᴀɴ ᴄᴏᴅᴇx
│ 🔧 ᴘʀᴇꜰɪx: ${prefix}
│ 📦 ᴛᴏᴛᴀʟ: ${totalCommands} ᴄᴏᴍᴍᴀɴᴅꜱ
│ 👥 ᴜꜱᴇʀꜱ: ${users}
│ ⏱️ ᴜᴘᴛɪᴍᴇ: ${hours}h ${minutes}m ${seconds}s
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
                            await client.sendMessage(msg.chat, { text: parts[i] }, { quoted: msg });
                        }
                    } else {
                        await client.sendMessage(msg.chat, { text: allMenuText }, { quoted: msg });
                    }
                    
                    await msg.react('✅');
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
                    buttonText: { displayText: '📜 ᴀʟʟ ᴄᴏᴍᴍᴀɴᴅꜱ' },
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
            
            await socket.sendMessage(sender, { react: { text: '✅', key: m.key } });
            
        } catch (error) {
            console.error('menu error:', error);
            
            // menu simples em caso de erro
            let simpleMenu = `💧 *ǫᴜᴇᴇɴ ɴᴀᴢᴜᴍᴀ ᴍɪɴɪ* 💧\n\n✨ hello ${m.pushName || 'user'}! ✨\n\n📚 total commands: ${Array.from(plugins.keys()).filter(k => k === plugins.get(k)?.name).length}\n🕐 time: ${moment().tz('africa/kinshasa').format('dd/mm/yyyy hh:mm')}\n\n💡 use .allmenu to see all commands\n\n© ᴀʏᴀɴ ᴄᴏᴅᴇx`;
            
            await socket.sendMessage(sender, { text: simpleMenu }, { quoted: m });
        }
    }
};