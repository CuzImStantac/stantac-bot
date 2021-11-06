import chalk from 'chalk';
import {
  ApplicationCommand,
  ButtonInteraction,
  Client as DClient,
  ClientOptions,
  CommandInteraction,
  Guild,
  Interaction,
  MessageActionRow,
  MessageButton,
} from 'discord.js';
import { Bot, Command, Embed } from '.';
import { EmbedPreset } from '../types';

export class Client extends DClient {
  readonly bot: Bot;

  constructor(bot: Bot, options: ClientOptions) {
    super(options);
    this.bot = bot;

    this.on('newListener', (event: string) => {
      this.bot.logger.debug(
        `Added the listener "${chalk.yellowBright(event)}" to the client.`
      );
    });

    this.on('interactionCreate', (interaction: Interaction) => {
      try {
        if (interaction.isCommand()) return this.handleCommand(interaction);
        if (interaction.isButton()) return this.handleButton(interaction);
      } catch (e: Error | any) {
        this.bot.logger.error(
          `There was an error during the Interaction Processing! Error: ${chalk.redBright(
            e.message
          )}`
        );
        return;
      }
      return;
    });
  }

  updateCommands(): Promise<boolean> {
    this.bot.logger.info(
      `Checking ${chalk.yellowBright('ApplicationCommands')}...`
    );
    return new Promise(async (res) => {
      this.bot.logger.debug(
        `Fetching global ${chalk.yellowBright('ApplicationCommands')}...`
      );
      const commands = await this.application?.commands.fetch();
      this.bot.logger.debug(
        `Fetched ${chalk.blueBright(
          commands?.size ?? 0
        )} global ${chalk.yellowBright('ApplicationCommands')}`
      );
      if (commands?.size) {
        this.bot.logger.debug(
          `Cleaning old global ${chalk.yellowBright('ApplicationCommands')}...`
        );
        for (const command of commands.values()) {
          if (
            !this.bot.Commands.find(
              (c) => c.name.toLowerCase() === command.name
            ) ||
            (
              this.bot.Commands.find(
                (c) => c.name.toLowerCase() === command.name
              )?.getGuilds() || []
            ).length > 0
          ) {
            try {
              await this.application?.commands.delete(command.id);
              this.bot.logger.debug(
                `Deleted ${chalk.blueBright(command.name)}!`
              );
            } catch (e) {
              this.bot.logger.error(
                `Unable to delete ${chalk.redBright(command.name)}!`
              );
            }
          }
        }
        this.bot.logger.debug(
          `Global ${chalk.yellowBright('ApplicationCommand')} cleaning done.`
        );
      }

      for (const [commandName, command] of this.bot.Commands) {
        const guilds = command.getGuilds();
        if (guilds.length > 0) {
          // Guild specific
          this.bot.logger.info(
            `Checking ${chalk.blueBright(commandName)} on ${chalk.yellowBright(
              guilds.length
            )} guild${guilds.length === 1 ? '' : 's'}...`
          );

          for (const guildId of guilds) {
            let guild: Guild;

            try {
              guild = await this.guilds.fetch(guildId);
            } catch (e) {
              this.bot.logger.error(
                `${chalk.redBright(guildId)} is invalid! [${chalk.blueBright(
                  commandName
                )}]`
              );
              continue;
            }

            const guildCommands = await guild.commands.fetch();
            const guildInteraction = guildCommands.find(
              (c) => c.name === commandName.toLowerCase()
            );
            if (!guildInteraction) {
              try {
                await this.application?.commands.create(
                  command.data(),
                  guildId
                );
                this.bot.logger.debug(
                  `Created ${chalk.blueBright(commandName)} on ${chalk.magenta(
                    guildId
                  )}.`
                );
              } catch (e) {
                this.bot.logger.error(
                  `Unable to create ${chalk.blueBright(
                    commandName
                  )} on ${chalk.magenta(guildId)}!`
                );
              }
            } else {
              if (!guildInteraction.equals(command.data(), true)) {
                try {
                  await guildInteraction.edit(command.data());
                  this.bot.logger.debug(
                    `Updated ${chalk.blueBright(
                      commandName
                    )} on ${chalk.magenta(guildId)}.`
                  );
                } catch (e) {
                  this.bot.logger.error(
                    `Unable to edit ${chalk.blueBright(
                      commandName
                    )} on ${chalk.magenta(guildId)}!`
                  );
                }
              }
            }
          }
        } else {
          // Global
          this.bot.logger.info(
            `Checking ${chalk.blueBright(commandName)} globally...`
          );
          const globalInteraction = commands?.find(
            (c) => c.name === commandName.toLowerCase()
          );
          if (!globalInteraction) {
            try {
              await this.application?.commands.create(command.data());
              this.bot.logger.debug(
                `Created ${chalk.blueBright(commandName)} globally.`
              );
            } catch (e) {
              this.bot.logger.error(
                `Unable to create ${chalk.blueBright(commandName)} globally!`
              );
            }
          } else {
            if (!globalInteraction.equals(command.data(), true)) {
              try {
                await globalInteraction.edit(command.data());
                this.bot.logger.debug(
                  `Updated ${chalk.blueBright(commandName)} globally.`
                );
              } catch (e) {
                this.bot.logger.error(
                  `Unable to edit ${chalk.blueBright(commandName)} globally!`
                );
              }
            }
          }
        }
      }
      res(true);
    });
  }

  handleButton(interaction: ButtonInteraction): Promise<void> {
    return new Promise(async (res) => {
      if (interaction.customId.startsWith('delete-')) {
        const commandId = interaction.customId.split('-').slice(1).join('-');
        let command;
        //Todo: Fix this code and make it more compakt
        try {
          command = await this.application?.commands.fetch(commandId);
        } catch (e) {}

        if (!command) {
          try {
            command = await interaction.guild?.commands.fetch(commandId);
          } catch (e) {}
        }
        try {
          if (command instanceof ApplicationCommand) {
            await command.delete();
            await interaction.update({
              embeds: [
                new Embed().preset(
                  this.bot,
                  EmbedPreset.SUCCESS,
                  `Deleted the  Command [\`${command.name}\`] successfuly!`
                ),
              ],
              components: [],
            });
          } else throw new Error('Could not fetch a ApplicationCommand!');
        } catch (e) {
          await interaction.update({
            embeds: [
              new Embed().preset(
                this.bot,
                EmbedPreset.ERROR,
                'Could not fetch a ApplicationCommand!'
              ),
            ],
            components: [],
          });
        }
      }
      return res();
    });
  }
  handleCommand(interaction: CommandInteraction): Promise<void> {
    return new Promise(async (res) => {
      const command: typeof Command | undefined = this.bot.Commands.find(
        (c) => c.name.toLowerCase() === interaction.commandName
      );
      if (!command) {
        const errorReply = {
          embeds: [
            new Embed().preset(
              this.bot,
              EmbedPreset.ERROR,
              'This command does not exist!'
            ),
          ],
          ephemeral: true,
        };
        if (!this.bot.Config.owners.includes(interaction.user.id)) {
          await interaction.reply(errorReply);
        } else {
          Object.assign(errorReply, {
            components: [
              new MessageActionRow().addComponents(
                new MessageButton()
                  .setEmoji('🗑')
                  .setLabel('Delete Command')
                  .setStyle('DANGER')
                  .setCustomId(`delete-${interaction.commandId}`)
              ),
            ],
          });

          await interaction.reply(errorReply);
        }
        return res();
      }
      const allowedGuilds = command.getGuilds();
      if (
        allowedGuilds.length > 0 &&
        !allowedGuilds.includes(interaction.guildId)
      ) {
        await interaction.reply({
          embeds: [
            new Embed().preset(
              this.bot,
              EmbedPreset.ERROR,
              'This command is not allowed in this guild!'
            ),
          ],
          ephemeral: true,
        });

        try {
          await this.application?.commands.delete(
            interaction.commandId,
            interaction.guildId
          );
          this.bot.logger.success(
            `Deleted ${chalk.blueBright(command.name)} from ${chalk.redBright(
              interaction.guildId
            )}. (${chalk.grey('Guild only Command')})`
          );
        } catch (e) {
          this.bot.logger.error(
            `Unable to delete ${chalk.blueBright(
              command.name
            )} from ${chalk.redBright(interaction.guildId)}! (${chalk.grey(
              'Guild only Command'
            )})`
          );
        }
        return res();
      }

      try {
        await command.execute(this, interaction);
      } catch (e: Error | any) {
        await interaction.reply({
          embeds: [
            new Embed().preset(
              this.bot,
              EmbedPreset.ERROR,
              'There was an error during the command execution!'
            ),
          ],
          ephemeral: true,
        });
        this.bot.logger.error(
          `There was an error during the execution of ${chalk.blueBright(
            command.name
          )}! Error: ${chalk.redBright(e.message)}`
        );
      }
      return res();
    });
  }

  login(token?: string): Promise<string> {
    this.bot.logger.info('Logging in the Client...');
    return new Promise((res) => {
      super
        .login(token)
        .then((o) => {
          this.bot.logger.success(
            `Client succesfully logged in as ${chalk.magentaBright(
              this.user?.tag || 'Unknown#0000'
            )} (${chalk.grey(this.user?.id || '000000000000000000')})!`
          );
          res(o);

          this.bot.logger.info(
            `Invite: ${this.generateInvite({
              scopes: ['applications.commands', 'bot'],
              permissions: ['ADMINISTRATOR'],
            })}`
          );
          this.updateCommands();
        })
        .catch((e) => {
          this.bot.logger.error(
            `Unable to login the client! Error: ${e.message}`
          );
          res(e.message);
        });
    });
  }
}
