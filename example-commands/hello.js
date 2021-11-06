const { CommandInteraction } = require('discord.js');
const { Command, Client } = require('../build');

module.exports = class Hello extends Command {
  static description = 'Says hello';
  static options = [
    {
      name: 'member',
      description: 'The user to say hello to',
      type: 'USER',
      required: false,
    },
  ];
  static guild = ['902708979334021120', '656027905414922253'];

  /**
   *
   * @param {Client} client
   * @param {CommandInteraction} interaction
   */
  static execute(client, interaction) {
    interaction.reply(
      `Hello ${interaction.options.getMember('member')?.displayName ?? 'World'}`
    );
  }
};
