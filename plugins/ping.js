// plugins/ping.js
const moment = require('moment-timezone');
const os = require('os');
const axios = require('axios');

const audio_url = 'https://files.catbox.moe/rdzcvr.mp3';

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

module.exports = {
    name: 'ping',
    aliases: ['latency', 'speed', 'pong'],
    description: "🏓 check queen nazuma mini's response time",
    category: 'general',
    
    async execute(socket, m, args, sender, isOwner, isGroup, isSenderGroupAdmin, config, plugins) {
        try {
            // enviar áudio primeiro
            await m.react('🎵');
            
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
            
            const startTime = Date.now();
            
            const emojis = ['🔥', '⚡', '🚀', '💨', '🎯', '🎉', '🌟', '💥', '🕐', '🔹', '💎', '🏆', '🎶', '🌠', '🌀', '🔱', '🛡️', '✨', '💧', '👑'];
            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
            
            // react instantly with a random emoji
            await socket.sendMessage(m.chat, {
                react: { text: randomEmoji, key: m.key }
            });
            
            const ping = Date.now() - startTime;
            
            // speed categorization
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
            
            // get ping image
            const pingImageUrl = config.bot_image || 'https://files.catbox.moe/vd7maj.jpg';
            let imageBuffer = null;
            
            try {
                imageBuffer = await getBuffer(pingImageUrl);
            } catch (err) {
                console.error('failed to load ping image:', err);
            }
            
            // message caption
            const caption = `💧✨ *ǫᴜᴇᴇɴ ɴᴀᴢᴜᴍᴀ ᴘɪɴɢ* ✨💧
> *ʀᴇꜱᴘᴏɴꜱᴇ:* ${ping} ms ${randomEmoji}
> *ꜱᴛᴀᴛᴜꜱ:* ${color} ${badge}
> *ᴠᴇʀꜱɪᴏɴ:* 2.0.0
> 💧 *ǫᴜᴇᴇɴ ɴᴀᴢᴜᴍᴀ ᴍɪɴɪ* 💧`;
            
            // send image with caption
            if (imageBuffer) {
                await socket.sendMessage(m.chat, {
                    image: imageBuffer,
                    caption: caption,
                    contextInfo: {
                        mentionedJid: [m.sender],
                        forwardingScore: 999,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363407904372384@newsletter',
                            newsletterName: "💧 ǫᴜᴇᴇɴ ɴᴀᴢᴜᴍᴀ ᴍɪɴɪ 💧",
                            serverMessageId: 143
                        }
                    }
                }, { quoted: m });
            } else {
                // fallback to text only if image fails
                await socket.sendMessage(m.chat, {
                    text: caption,
                    contextInfo: {
                        mentionedJid: [m.sender],
                        forwardingScore: 999,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363407904372384@newsletter',
                            newsletterName: "💧 ǫᴜᴇᴇɴ ɴᴀᴢᴜᴍᴀ ᴍɪɴɪ 💧",
                            serverMessageId: 143
                        }
                    }
                }, { quoted: m });
            }
            
            await m.react('✅');
            
        } catch (e) {
            console.error("❌ error in ping command:", e);
            await socket.sendMessage(m.chat, { text: `⚠️ error: ${e.message}` }, { quoted: m });
        }
    }
};