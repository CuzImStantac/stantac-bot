import { Collection, Intents } from 'discord.js';
import {
  BootOptions,
  BotConfig,
  BotOptions,
  ClientColors,
  ClientEmojis,
  EventType,
} from '../types';
import { readdirSync } from 'fs';
import * as path from 'path';
import {
  JsonDatabase,
  SqlDatabase,
  Client,
  Command,
  Event,
  Logger,
  Utils,
} from '.';
import chalk from 'chalk';

export class Bot {
  static id = 0;
  public static readonly clients: Record<number, Bot> = {};

  readonly id: number;
  readonly Config: BotConfig;
  readonly Commands: Collection<string, typeof Command> = new Collection();
  readonly Events: Collection<EventType, Collection<string, typeof Event>> =
    new Collection();
  readonly options: BootOptions = {
    debug: false,
  };
  readonly client: Client;
  readonly logger = new Logger(this);
  public readonly database: SqlDatabase | JsonDatabase;
  public cache = {};
  readonly utils = new Utils(this);
  readonly Emojis: ClientEmojis;
  readonly Colors: ClientColors;

  setCommands(
    filePath: string,
    keepOld?: boolean
  ): Promise<Record<'success' | 'error', number>> {
    const output: Record<'success' | 'error', number> = {
      error: 0,
      success: 0,
    };

    if (!keepOld) this.Commands.clear();

    return new Promise(async (resolve) => {
      for (const file of readdirSync(
        path.join(__dirname, '..', '..', filePath),
        {
          withFileTypes: true,
        }
      )) {
        if (file.isDirectory()) {
          const { success, error } = await this.setCommands(
            path.join(filePath, file.name),
            true
          );

          output.success += success;
          output.error += error;
        } else {
          if (!file.name.endsWith('.js')) continue;

          const command: typeof Command = (
            await import(path.join(__dirname, '..', '..', filePath, file.name))
          )?.default;

          if (!command) {
            this.logger.error(`${chalk.redBright(file.name)} is invalid!`);
            output.error++;
            continue;
          }

          try {
            this.Commands.set(command.name, command);
          } catch (e) {
            output.error++;
            continue;
          }

          output.success++;
          this.logger.debug(
            `${
              chalk.grey('[') + chalk.greenBright('COMMAND') + chalk.grey(']')
            } Registered ${chalk.yellowBright(command.name)} successfully!`
          );
        }
        continue;
      }
      resolve(output);
    });
  }

  setEvents(
    filePath: string,
    keepOld?: boolean
  ): Promise<Record<'success' | 'error', number>> {
    const output: Record<'success' | 'error', number> = {
      error: 0,
      success: 0,
    };

    if (!keepOld) this.Events.clear();

    return new Promise(async (resolve) => {
      for (const file of readdirSync(
        path.join(__dirname, '..', '..', filePath),
        {
          withFileTypes: true,
        }
      )) {
        if (file.isDirectory()) {
          const { success, error } = await this.setEvents(
            path.join(filePath, file.name),
            true
          );

          output.success += success;
          output.error += error;
        } else {
          if (!file.name.endsWith('.js')) continue;
          const event: typeof Event = (
            await import(path.join(__dirname, '..', '..', filePath, file.name))
          )?.default;

          if (!event) {
            this.logger.error(`${chalk.redBright(file.name)} is invalid!`);
            output.error++;
            continue;
          }

          try {
            let registered = await event.register(this);
            if (!registered) {
              output.error++;
              this.logger.error(
                `Unable to register ${chalk.yellowBright(event.name)}`
              );
              continue;
            }

            if (!this.Events.get(event.type)) {
              this.Events.set(event.type, new Collection());
              this.logger.debug(
                `Created a Event type for ${chalk.yellowBright(
                  EventType[event.type]
                )}`
              );
            }

            this.Events.get(event.type)?.set(event.name, event);
          } catch (e) {
            output.error++;
            continue;
          }

          output.success++;
          this.logger.debug(
            `${
              chalk.grey('[') + chalk.greenBright('EVENT') + chalk.grey(']')
            } Registered ${chalk.yellowBright(event.name)} successfully!`
          );
        }
        continue;
      }
      resolve(output);
    });
  }

  constructor(options: BotOptions) {
    const { config, database, commandsPath, eventsPath, colors, emojis } =
      options;

    this.id = Bot.id++;

    Bot.clients[this.id] = this;

    this.logger.info(
      `Client ${chalk.cyan('BOT-')}${chalk.cyanBright(this.id)} created!`
    );

    this.Config = config;
    this.Colors = colors;
    this.Emojis = emojis;

    if (!database) throw new Error('No database provided!');
    this.database = database;
    this.logger.info(
      `Selected ${chalk.magentaBright(
        Object.getPrototypeOf(this.database).constructor.name
      )} as Database.`
    );

    if (this.database instanceof JsonDatabase) this.database.log(this);

    this.client = new Client(this, {
      intents: [Intents.FLAGS.GUILDS],
    });
    if (commandsPath) {
      this.logger.info(`Loading ${chalk.yellowBright('Commands')}...`);
      this.setCommands(commandsPath).then(({ success, error }) => {
        this.logger.info(
          `Loaded ${chalk.greenBright(success)} ${chalk.yellowBright(
            `Command${success === 1 ? '' : 's'}`
          )}. ${chalk.redBright(error)} invalid!`
        );
      });
    } else {
      this.logger.info(`${chalk.yellowBright('Command')} path unset!`);
    }

    if (eventsPath) {
      this.logger.info(`Loading ${chalk.yellowBright('Events')}...`);
      this.setEvents(eventsPath).then(({ success, error }) => {
        this.logger.info(
          `Loaded ${chalk.greenBright(success)} ${chalk.yellowBright(
            `Event${success === 1 ? '' : 's'}`
          )}. ${chalk.redBright(error)} invalid!`
        );
      });
    } else {
      this.logger.info(`${chalk.yellowBright('Event')} path unset!`);
    }

    this.client.login(this.Config.token);
  }
}
