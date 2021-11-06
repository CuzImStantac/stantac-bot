import {
  Snowflake,
  ClientEvents,
  ApplicationCommandOptionData,
  ColorResolvable,
  EmojiResolvable,
} from 'discord.js';
import { SqlDatabase, JsonDatabase, Bot } from '../classes';

export interface BotConfig {
  token: string;
  owners: Snowflake[];
  debug?: boolean;
}

export enum DatabaseType {
  'JSON' = 0,
  'SQL',
}

export interface DatabaseOptions {
  type: DatabaseType;
}

export enum EmbedPreset {
  'DEFAULT' = 0,
  'SUCCESS',
  'WARN',
  'ERROR',
  'LOADING',
}

export interface BotOptions {
  commandsPath?: string;
  eventsPath?: string;
  config: BotConfig;
  database: SqlDatabase | JsonDatabase;
  emojis: ClientEmojis;
  colors: ClientColors;
}

export interface BootOptions {
  debug?: boolean;
}

export interface SqlDatabaseOptions {
  host: string;
  port?: number;
  user: string;
  password: string;
  database: string;
  connectionLimit?: number;
  acquireTimeout?: number;
  queueLimit?: number;
  waitForConnections?: boolean;
}

export interface JsonDatabaseOptions {
  dirPath: string;
}

export type CommandOptions = ApplicationCommandOptionData;

export interface EventOptions {
  name: string;
  type: EventType;
  emitter?: string | keyof ClientEvents;
  timeout?: number;
  interval?: number;
  execute: (bot: Bot, ...args: any[]) => void;
}
export enum EventType {
  'PROCESS' = 1,
  'DISCORD',
  'INTERVAL',
  'TIMEOUT',
}

export interface ClientEmojis {
  success: EmojiResolvable;
  warn: EmojiResolvable;
  error: EmojiResolvable;
  loading: EmojiResolvable;
  custom?: Record<string, EmojiResolvable>;
}

export interface ClientColors {
  main: ColorResolvable;
  success: ColorResolvable;
  warn: ColorResolvable;
  error: ColorResolvable;
  loading: ColorResolvable;
  custom?: Record<string, ColorResolvable>;
}

export type PartialRecord<K extends keyof any, T> = {
  [P in K]?: T;
};
