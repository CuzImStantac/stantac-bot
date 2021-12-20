import { ButtonInteraction, MessageButton } from 'discord.js';
import { Client } from '.';

export abstract class Button {
  static prefix?: string;
  static id?: string;

  static button(options?: Record<string, unknown>): MessageButton {
    return new MessageButton()
      .setLabel("This button doesn't have a label!")
      .setStyle('PRIMARY')
      .setCustomId(
        [...Array(32)]
          .map(() => Math.floor(Math.random() * 16).toString(16))
          .join('')
      );
  }

  static execute(
    client: Client,
    interaction: ButtonInteraction,
    args?: string[]
  ) {
    interaction.reply({
      ephemeral: true,
      content: `${client.bot.Emojis.error} | This button doesn't have a execute function!`,
    });
  }
}
