import { GuildMember } from 'discord.js';
import { Bot, Client, Event } from '../../..';
import { EventType } from '../../../types';

export default class GuildMemberUpdate extends Event {
  static event: string = 'guildMemberUpdate';
  static type = EventType.DISCORD;
  static emitter = 'guildMemberUpdate';
  static timeout?: number;
  static interval?: number;
  static execute(
    bot: Bot,
    client: Client,
    oldMember: GuildMember,
    newMember: GuildMember
  ): void {
    if (!oldMember.premiumSinceTimestamp && newMember.premiumSince) {
      return;
    }
  }
}
