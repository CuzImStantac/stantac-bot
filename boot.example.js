const { Bot, JsonDatabase } = require('./build');
const { config } = require('dotenv');
config();

new Bot({
  database: new JsonDatabase({ dirPath: './data' }),
  commandsPath: 'example-commands',
  colors: {
    error: '#ff0000',
    warn: '#ffa500',
    loading: '#00ff00',
    main: '#00ffff',
    success: '#00ff00',
  },
  emojis: {
    error: '❌',
    loading: '⏳',
    success: '✅',
    warn: '⚠️',
  },
  config: {
    owners: [],
    token: process.env.TOKEN || '',
    debug: true,
  },
});
