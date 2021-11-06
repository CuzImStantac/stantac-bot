import { Bot } from './';
import { createHash } from 'crypto';

export class Utils {
  private readonly bot: Bot;

  constructor(bot: Bot) {
    this.bot = bot;
  }

  hash(text: string): string {
    return createHash('sha256').update(Buffer.from(text)).digest('hex');
  }

  hashBotName(): string | null {
    return this.bot.client?.user?.username
      ? this.hash(this.bot.client?.user?.username)
      : null;
  }
}
