import { EventType, FileLoaderType, LoadingStats } from '../types';
import { Bot, Command, Event, Button } from '.';
import { existsSync, readdirSync } from 'fs';
import path from 'path';
import chalk from 'chalk';
import { Collection } from 'discord.js';

export class FileLoader {
  bot: Bot;
  type: FileLoaderType;
  filePath: string;

  constructor(bot: Bot, type: FileLoaderType, filePath: string) {
    this.bot = bot;
    this.type = type;
    this.filePath = filePath;
  }

  promise(): Promise<LoadingStats> {
    const output: LoadingStats = {
      error: 0,
      success: 0,
    };
    return new Promise(async (resolve) => {
      if (!existsSync(path.join(__dirname, '..', '..', this.filePath)))
        return resolve(output);

      for (const file of readdirSync(
        path.join(__dirname, '..', '..', this.filePath),
        {
          withFileTypes: true,
        }
      )) {
        if (file.isDirectory()) {
          const { success, error } = await new FileLoader(
            this.bot,
            this.type,
            path.join(this.filePath, file.name)
          ).promise();

          output.success += success;
          output.error += error;
        } else {
          if (!file.name.endsWith('.js')) continue;
          const classFile: typeof Event | typeof Command | typeof Button = (
            await import(
              path.join(__dirname, '..', '..', this.filePath, file.name)
            )
          )?.default;

          if (!classFile) {
            this.bot.logger.error(
              this.logString(`${chalk.redBright(file.name)} is invalid!`)
            );
            output.error++;
            continue;
          }

          try {
            const classPrototype = classFile.prototype;
            if (classPrototype instanceof Event) {
              let registered = await (classFile as typeof Event).register(
                this.bot
              );
              if (!registered) {
                output.error++;
                this.bot.logger.error(
                  this.logString(
                    `Unable to register ${chalk.yellowBright(
                      (classFile as typeof Event).name
                    )}`
                  )
                );
              } else {
                if (!this.bot.Events.get((classFile as typeof Event).type)) {
                  this.bot.Events.set(
                    (classFile as typeof Event).type,
                    new Collection()
                  );
                  this.bot.logger.debug(
                    this.logString(
                      `Created a Event type for ${chalk.yellowBright(
                        EventType[(classFile as typeof Event).type]
                      )}`
                    )
                  );
                }

                this.bot.Events.get((classFile as typeof Event).type)?.set(
                  (classFile as typeof Event).name,
                  classFile as typeof Event
                );
              }
            } else if (classPrototype instanceof Command) {
              this.bot.Commands.set(
                (classFile as typeof Command).name,
                classFile as typeof Command
              );
            } else if (classPrototype instanceof Button) {
              this.bot.Buttons.set(
                (classFile as typeof Button).name,
                classFile as typeof Button
              );
            } else throw 'Invalid class type';
          } catch (e) {
            output.error++;
            continue;
          }

          output.success++;
          this.bot.logger.debug(
            this.logString(
              `Registered ${chalk.yellowBright(
                classFile?.name ?? file.name
              )} successfully!`
            )
          );
        }
        continue;
      }
      resolve(output);
    });
  }

  logString(text: string) {
    return `${
      chalk.grey('[') +
      chalk.greenBright(FileLoaderType[this.type]) +
      chalk.grey(']')
    } ${text}`;
  }
}
