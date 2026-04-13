// plugins/song.js
const axios = require('axios');
const yts = require('yt-search');

const API_BASE = 'https://api.delirius.store';

// função para baixar buffer
async function getBuffer(url) {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 30000 });
        return Buffer.from(response.data);
    } catch (error) {
        console.error('buffer download error:', error);
        return null;
    }
}

module.exports = {
    name: 'song',
    aliases: ['play', 'ytmp3', 'music'],
    description: '🎵 download audio from youtube by name or link',
    category: 'downloads',
    
    async execute(socket, m, args, sender, isOwner, isGroup, isSenderGroupAdmin, config, plugins) {
        const input = args.join(' ');
        
        if (!input) {
            const text = `💧✨ *ǫᴜᴇᴇɴ ɴᴀᴢᴜᴍᴀ ᴍɪɴɪ* ✨💧

🎵 *ᴍᴜꜱɪᴄ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*

📌 *ᴜꜱᴀɢᴇ:* 
• .ꜱᴏɴɢ <ʏᴏᴜᴛᴜʙᴇ ʟɪɴᴋ>
• .ꜱᴏɴɢ <ꜱᴏɴɢ ɴᴀᴍᴇ>

📋 *ᴇxᴀᴍᴘʟᴇꜱ:* 
• .ꜱᴏɴɢ ʙᴇʟɪᴇᴠᴇʀ - ɪᴍᴀɢɪɴᴇ ᴅʀᴀɢᴏɴꜱ
• .ꜱᴏɴɢ ʜᴛᴛᴘꜱ://ʏᴏᴜᴛᴜ.ʙᴇ/ᴅǫᴡ4ᴡ9ᴡɢxᴄǫ

> 💧 *ǫᴜᴇᴇɴ ɴᴀᴢᴜᴍᴀ ᴍɪɴɪ* 💧`;
            
            await socket.sendMessage(sender, { text: text }, { quoted: m });
            return;
        }
        
        await socket.sendMessage(sender, { react: { text: '⏳', key: m.key } });
        
        try {
            let videoUrl = input;
            let videoTitle = '';
            let videoAuthor = '';
            let videoDuration = '';
            let videoThumbnail = '';
            
            // check if input is a youtube url
            const ytUrlRegex = /(youtube\.com|youtu\.be)/i;
            const isUrl = ytUrlRegex.test(input);
            
            // if not url, search for the video
            if (!isUrl) {
                console.log('🔍 searching for: ' + input);
                const searchResults = await yts(input);
                
                if (!searchResults || !searchResults.videos || searchResults.videos.length === 0) {
                    throw new Error('no videos found for this search');
                }
                
                const firstResult = searchResults.videos[0];
                videoUrl = firstResult.url;
                videoTitle = firstResult.title;
                videoAuthor = firstResult.author?.name || 'unknown';
                videoDuration = firstResult.duration?.timestamp || 'n/a';
                videoThumbnail = firstResult.thumbnail;
                
                console.log('✅ found: ' + videoTitle);
            }
            
            // download audio using delirius api
            const apiUrl = `${API_BASE}/download/ytmp3?url=${encodeURIComponent(videoUrl)}`;
            console.log('📥 downloading: ' + apiUrl);
            
            const response = await axios.get(apiUrl, { timeout: 30000 });
            
            if (!response.data?.status || !response.data?.data) {
                throw new Error('failed to fetch audio data');
            }
            
            const data = response.data.data;
            const title = videoTitle || data.title || 'unknown title';
            const format = data.format || 'mp3';
            const thumbnail = videoThumbnail || data.image;
            const audioUrl = data.download;
            
            if (!audioUrl) {
                throw new Error('download url not available');
            }
            
            const sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
            
            if (!global.buttonHandlers) global.buttonHandlers = new Map();
            
            // audio button
            const audioId = 'play_audio_' + sessionId;
            global.buttonHandlers.set(audioId, async (client, msg, btnId) => {
                await msg.react('⏳');
                try {
                    const audioBuffer = await getBuffer(audioUrl);
                    const sizeMB = (audioBuffer.length / 1024 / 1024).toFixed(2);
                    
                    await client.sendMessage(msg.chat, {
                        audio: audioBuffer,
                        mimetype: 'audio/mpeg',
                        ptt: false,
                        caption: `🎵 *${title}*\n👤 *${videoAuthor || 'unknown'}*\n⏱️ *${videoDuration || 'n/a'}*\n💾 *${sizeMB} mb*\n📁 *format:* ${format.toUpperCase()}\n\n> 💧 *ǫᴜᴇᴇɴ ɴᴀᴢᴜᴍᴀ ᴍɪɴɪ* 💧`
                    }, { quoted: msg });
                    
                    await msg.react('✅');
                } catch (err) {
                    await msg.react('❌');
                    await client.sendMessage(msg.chat, { text: `❌ *download error:*\n\n${err.message}` }, { quoted: msg });
                }
            });
            
            // voice note button
            const voiceId = 'play_voice_' + sessionId;
            global.buttonHandlers.set(voiceId, async (client, msg, btnId) => {
                await msg.react('⏳');
                try {
                    const audioBuffer = await getBuffer(audioUrl);
                    
                    await client.sendMessage(msg.chat, {
                        audio: audioBuffer,
                        mimetype: 'audio/mpeg',
                        ptt: true,
                        caption: `🎙️ *voice note*\n🎵 *${title}*\n👤 *${videoAuthor || 'unknown'}*\n\n> 💧 *ǫᴜᴇᴇɴ ɴᴀᴢᴜᴍᴀ ᴍɪɴɪ* 💧`
                    }, { quoted: msg });
                    
                    await msg.react('✅');
                } catch (err) {
                    await msg.react('❌');
                    await client.sendMessage(msg.chat, { text: `❌ *voice note error:*\n\n${err.message}` }, { quoted: msg });
                }
            });
            
            // document button
            const docId = 'play_doc_' + sessionId;
            global.buttonHandlers.set(docId, async (client, msg, btnId) => {
                await msg.react('⏳');
                try {
                    const audioBuffer = await getBuffer(audioUrl);
                    const cleanTitle = title.replace(/[^\w\s]/gi, '').substring(0, 50);
                    
                    await client.sendMessage(msg.chat, {
                        document: audioBuffer,
                        mimetype: 'audio/mpeg',
                        fileName: `${cleanTitle}.${format}`,
                        caption: `📄 *document*\n🎵 *${title}*\n👤 *${videoAuthor || 'unknown'}*\n📁 ${cleanTitle}.${format}\n\n> 💧 *ǫᴜᴇᴇɴ ɴᴀᴢᴜᴍᴀ ᴍɪɴɪ* 💧`
                    }, { quoted: msg });
                    
                    await msg.react('✅');
                } catch (err) {
                    await msg.react('❌');
                    await client.sendMessage(msg.chat, { text: `❌ *document error:*\n\n${err.message}` }, { quoted: msg });
                }
            });
            
            // get thumbnail
            let thumbBuffer = null;
            if (thumbnail) {
                try {
                    thumbBuffer = await getBuffer(thumbnail);
                } catch (err) {}
            }
            
            const infoMessage = `💧✨ *ǫᴜᴇᴇɴ ɴᴀᴢᴜᴍᴀ ᴍɪɴɪ* ✨💧

🎵 *ᴛɪᴛʟᴇ:* ${title}
👤 *ᴀʀᴛɪꜱᴛ:* ${videoAuthor || 'unknown'}
⏱️ *ᴅᴜʀᴀᴛɪᴏɴ:* ${videoDuration || 'n/a'}
📁 *ꜰᴏʀᴍᴀᴛ:* ${format.toUpperCase()}

👇 *ꜱᴇʟᴇᴄᴛ ᴀɴ ᴏᴘᴛɪᴏɴ:*

> 💧 *ǫᴜᴇᴇɴ ɴᴀᴢᴜᴍᴀ ᴍɪɴɪ* 💧`;
            
            await socket.sendMessage(sender, {
                image: thumbBuffer,
                caption: infoMessage,
                footer: '💧 ǫᴜᴇᴇɴ ɴᴀᴢᴜᴍᴀ ᴍɪɴɪ 💧',
                buttons: [
                    { buttonId: audioId, buttonText: { displayText: '🎵 ᴀᴜᴅɪᴏ' }, type: 1 },
                    { buttonId: voiceId, buttonText: { displayText: '🎙️ ᴠᴏɪᴄᴇ ɴᴏᴛᴇ' }, type: 1 },
                    { buttonId: docId, buttonText: { displayText: '📄 ᴅᴏᴄᴜᴍᴇɴᴛ' }, type: 1 }
                ],
                headerType: 1
            }, { quoted: m });
            
            await socket.sendMessage(sender, { react: { text: '✅', key: m.key } });
            
        } catch (error) {
            console.error('play error:', error);
            await socket.sendMessage(sender, { react: { text: '❌', key: m.key } });
            
            let errorMsg = `❌ *ᴇʀʀᴏʀ:*\n\n`;
            if (error.response?.status === 403) {
                errorMsg += `ᴀᴘɪ ᴀᴄᴄᴇꜱꜱ ꜰᴏʀʙɪᴅᴅᴇɴ. ᴛʀʏ ᴀɢᴀɪɴ ʟᴀᴛᴇʀ.`;
            } else if (error.code === 'econnaborted') {
                errorMsg += `ʀᴇQᴜᴇꜱᴛ ᴛɪᴍᴇᴏᴜᴛ. ᴛʀʏ ᴀɢᴀɪɴ.`;
            } else {
                errorMsg += `${error.message || 'ꜰᴀɪʟᴇᴅ ᴛᴏ ᴅᴏᴡɴʟᴏᴀᴅ ᴀᴜᴅɪᴏ'}`;
            }
            errorMsg += `\n\n> 💧 *ǫᴜᴇᴇɴ ɴᴀᴢᴜᴍᴀ ᴍɪɴɪ* 💧`;
            
            await socket.sendMessage(sender, { text: errorMsg }, { quoted: m });
        }
    }
};