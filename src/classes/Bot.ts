import { Collection, Intents } from 'discord.js';
import {
  BootOptions,
  BotConfig,
  BotOptions,
  ClientColors,
  ClientEmojis,
  EventType,
  FileLoaderType,
  LoadingStats,
} from '../types';
import {
  JsonDatabase,
  SqlDatabase,
  Client,
  Command,
  Event,
  Button,
  Logger,
  Utils,
  FileLoader,
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
  readonly Buttons: Collection<string, typeof Button> = new Collection();
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

  setCommands(filePath: string, keepOld?: boolean): Promise<LoadingStats> {
    if (!keepOld) this.Commands.clear();

    return new FileLoader(this, FileLoaderType.COMMAND, filePath).promise();
  }

  setEvents(filePath: string, keepOld?: boolean): Promise<LoadingStats> {
    if (!keepOld) this.Events.clear();

    return new FileLoader(this, FileLoaderType.EVENT, filePath).promise();
  }

  setButtons(filePath: string, keepOld?: boolean): Promise<LoadingStats> {
    if (!keepOld) this.Buttons.clear();
    return new FileLoader(this, FileLoaderType.BUTTON, filePath).promise();
  }

  constructor(options: BotOptions) {
    const {
      config,
      database,
      commandsPath,
      eventsPath,
      buttonsPath,
      colors,
      emojis,
    } = options;

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

    if (buttonsPath) {
      this.logger.info(`Loading ${chalk.yellowBright('Buttons')}...`);
      this.setButtons(buttonsPath).then(({ success, error }) => {
        this.logger.info(
          `Loaded ${chalk.greenBright(success)} ${chalk.yellowBright(
            `Button${success === 1 ? '' : 's'}`
          )}. ${chalk.redBright(error)} invalid!`
        );
      });
    } else {
      this.logger.info(`${chalk.yellowBright('Buttons')} path unset!`);
    }

    this.client.login(this.Config.token);
  }
}
