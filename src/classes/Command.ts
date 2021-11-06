import { ApplicationCommandData, CommandInteraction } from 'discord.js';
import { Client } from '.';
import { CommandOptions } from '../types';

export abstract class Command {
  static description?: string;
  static guild?: string[] | string;
  static options?: CommandOptions[];
  static defaultPermissions: boolean;

  static getGuilds(): string[] {
    return this.guild
      ? Array.isArray(this.guild)
        ? this.guild
        : [this.guild]
      : [];
  }

  static data(): ApplicationCommandData {
    return {
      name: this.name.toLowerCase(),
      description: this.description || 'No description provided.',
      type: 'CHAT_INPUT',
      options: this.options ?? [],
      defaultPermission: this.defaultPermissions,
    };
  }
  static execute(client: Client, interaction: CommandInteraction) {
    interaction.reply(
      `${client.bot.Emojis.error} | This command doesn't have a execute function!`
    );
  }
}
