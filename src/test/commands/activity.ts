import { ActivityManager, Client, Command, Embed } from '../../classes';
import { CommandInteraction, VoiceChannel } from 'discord.js';
import { CommandOptions, EmbedPreset } from '../../types';

export default class Activity extends Command {
  static options: CommandOptions[] = [
    {
      name: 'channel',
      description: 'The channel to create the activity in.',
      type: 'CHANNEL',
      channelTypes: ['GUILD_VOICE'],
      required: true,
    },
    {
      name: 'activity',
      description: 'The activity to create.',
      type: 'STRING',
      required: true,
      choices: Object.entries(ActivityManager.all()).map(
        ([name, value]: [string, string]) => {
          return { name, value };
        }
      ),
    },
    {
      name: 'private',
      description: 'Whether the activity should be private. (Default: Public)',
      type: 'BOOLEAN',
      required: false,
    },
  ];
  static guild = ['656027905414922253', '900504645582082079'];
  static description = 'Create a Voice Channel activity';

  static async execute(client: Client, interaction: CommandInteraction): Promise<void> {
    if (
      !interaction.guild?.me
        ?.permissionsIn(interaction.options.getChannel('channel')!.id)
        .has('CREATE_INSTANT_INVITE')
    ) {
      interaction.reply({
        ephemeral: true,
        embeds: [
          new Embed().preset(
            client.bot,
            EmbedPreset.ERROR,
            'Missing Permission: `CREATE_INSTANT_INVITE`'
          ),
        ],
      });
      return;
    }
    client.activityManager
      .create(
        (interaction.options.getChannel('channel') as VoiceChannel)!,
        interaction.options.getString('activity')!
      )
      .then((invite) => {
        interaction.reply({
          ephemeral: interaction.options.getBoolean('private') ?? false,
          embeds: [
            new Embed().preset(
              client.bot,
              EmbedPreset.SUCCESS,
              `[Click to open ${invite.targetApplication!.name} in ${
                invite.channel!.name
              }](<https://discord.gg/${invite.code}>)`
            ),
          ],
        });
      })
      .catch(() => {
        interaction.reply({
          ephemeral: true,
          embeds: [
            new Embed().preset(
              client.bot,
              EmbedPreset.ERROR,
              'Unable to create Activity!'
            ),
          ],
        });
      });
  }
}
