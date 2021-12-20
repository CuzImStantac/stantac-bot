import { Bot, JsonDatabase } from './classes';
import { config } from 'dotenv';
config();
const db = new JsonDatabase({ dirPath: 'data' });

new Bot({
  commandsPath: 'build/commands',
  eventsPath: 'build/events',
  buttonsPath: 'build/buttons',
  config: {
    token: process.env['TOKEN']!,
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
