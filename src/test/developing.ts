import { Bot, JsonDatabase } from '../classes';
import { config } from 'dotenv';
config();
const db = new JsonDatabase({ dirPath: 'data' });

new Bot({
  commandsPath: 'lib/test/commands',
  eventsPath: 'lib/test/events',
  buttonsPath: 'lib/test/buttons',
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
