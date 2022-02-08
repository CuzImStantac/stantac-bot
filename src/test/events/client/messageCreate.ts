import { Message, MessageAttachment } from 'discord.js';
import { Event, EventType, Bot } from '../../../';
export default class MessageCreate extends Event {
  static emitter = 'messageCreate';
  static type = EventType.DISCORD;

  static execute(bot: Bot, message: Message) {
    if (
      message.channel.type === 'DM' ||
      message.author.bot ||
      !message.content.startsWith('zt!')
    )
      return;
    if (message.channel.id !== '814180080074227812') return;

    const args: string[] = message.content.trim().split(/\s+/);
    const cmd = args.shift()!.slice(3).toLowerCase();

    switch (cmd) {
      //   case 'att':
      //     message.reply({
      //       attachments: message.attachments.map(
      //         (a: MessageAttachment) => new MessageAttachment(a.url, a.name)
      //       ),
      //     });
      //     break;
      case 'att2':
        message.reply({
          content: 'Bitte nicht...',
          attachments: [
            new MessageAttachment(
              'https://cdn.discordapp.com/attachments/814180080074227812/927322373210902618/0mn9dbrxeb851.png',
              'test.png'
            ),
          ],
        });
        break;
    }
  }
}
