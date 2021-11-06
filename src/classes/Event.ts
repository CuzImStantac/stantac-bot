import chalk from 'chalk';
import { ClientEvents } from 'discord.js';
import { EventType } from '../types';
import { Bot } from './';

export abstract class Event {
  static event: string;
  static type: EventType;
  static emitter?: keyof ClientEvents | string;
  static timeout?: number;
  static interval?: number;
  static register(bot: Bot): Promise<boolean> {
    return new Promise(async (resolve) => {
      try {
        switch (this.type) {
          case EventType.PROCESS:
            break;
          case EventType.DISCORD:
            if (this?.emitter)
              bot.client.on(this.emitter, (...args) => {
                bot.logger.debug(
                  `Client triggered the event "${chalk.yellowBright(
                    this.name
                  )}".`
                );
                try {
                  this.execute(bot, ...args);
                } catch (e: Error | any) {
                  bot.logger.error(
                    `Unable to execute ${chalk.redBright(this.name)}! Error: ${
                      e.message
                    }`
                  );
                }
              });
            break;
          case EventType.INTERVAL:
            break;
          case EventType.TIMEOUT:
            break;
        }
        return resolve(true);
      } catch (e) {
        return resolve(false);
      }
    });
  }

  static getName() {
    Object.getPrototypeOf(this).constructor.name;
  }
  static getType() {
    return EventType[this.type];
  }

  static execute(bot: Bot, ...args: any[]): void {
    bot.logger.event(
      this,
      `Event not implemented! Recived ${chalk.yellowBright(
        args.length
      )} argument${args.length === 1 ? '' : 's'}.`
    );
  }
}
