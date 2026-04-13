const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const app = express();
__path = process.cwd();
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 8000;
let code = require('./pair');
let config = require('./config');

require('events').EventEmitter.defaultMaxListeners = 500;

// Load plugins
//const pluginManager = require('./plugins/manager');
//pluginManager.loadAllPlugins();

app.use('/code', code);
app.use('/pair', async (req, res, next) => {
    res.sendFile(__path + '/pair.html')
});
app.use('/', async (req, res, next) => {
    res.sendFile(__path + '/main.html')
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════╗
║                                   ║
║   💧ǫᴜᴇᴇɴ ɴᴀᴢᴜᴍᴀ ᴍɪɴɪ💧         ║
║   ʙᴏᴛ ɪs ʀᴜɴɴɪɴɢ!                ║
║   ᴘᴏʀᴛ: ${PORT}                      ║
║                                   ║
╚═══════════════════════════════════╝
    `)
});

module.exports = app;