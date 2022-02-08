import { Client, Command } from '../../classes';
import { CommandInteraction } from 'discord.js';
import { CommandOptions } from '../../types';

export default class Ping extends Command {
  static options: CommandOptions[];
  static guild = '656027905414922253';
  static description = 'Returns the connection speed to the WebSocket.';

  static async execute(client: Client, interaction: CommandInteraction): Promise<void> {
    interaction.reply(`Pong! \`${client.ws.ping}ms\``);
  }
}
