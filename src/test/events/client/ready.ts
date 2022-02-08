import { Bot, Client, Event } from '../../..';
import { EventType } from '../../../types';

export default class Ready extends Event {
  static type = EventType.DISCORD;
  static emitter = 'ready';
}
