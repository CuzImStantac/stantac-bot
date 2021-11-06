import { DatabaseOptions, DatabaseType } from '../types';

export class Database {
  readonly type: DatabaseType;
  constructor(options: DatabaseOptions) {
    const { type } = options;

    this.type = type;
  }
}
