import { Bot, JsonDatabase /* SqlDatabase */ } from './classes';
import { config } from 'dotenv';
config();

const db = new JsonDatabase({ dirPath: '../data' });

new Bot({
  commandsPath: './commands',
  eventsPath: './events',
  config: {
    token: process.env['TOKEN'] || '',
    owners: ['467414935530504192'],
    debug: true,
  },
  database: db,
  colors: {
    error: 'RED',
    loading: 'YELLOW',
    main: 'PURPLE',
    success: 'GREEN',
    warn: 'ORANGE',
  },
  emojis: {
    error: '❌',
    loading: '⏳',
    success: '✅',
    warn: '⚠️',
  },
});
