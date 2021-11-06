import { /*Bot, Client,*/ Event } from '../../classes';
import { EventType } from '../../types';

export default class Ready extends Event {
  static type = EventType.DISCORD;
  static emitter = 'ready';

  // static execute(bot: Bot, client: Client) {
  //   bot.logger.event(this, `${client?.user?.tag} is ready!`);
  // }
}
