import { Database } from "better-sqlite3";

export class BanTable {
  private readonly tableName = "bans";

  constructor(private readonly db: Database) {this.init()}

  /**
   * This bans a member
   */
  public ban(id: string): boolean {
    const info = this.db.prepare(
      `INSERT INTO ${this.tableName} VALUES (?)`
    ).run(id);

    return (info.changes > 0);
  }

  /**
   * Check if they're banned from using the bot
   */
  public isBanned(id: string): boolean {
    const row = this.db.prepare(
      `SELECT discord_id FROM ${this.tableName} WHERE discord_id=?`
    ).get(id);

    return (row != undefined);
  }

  /**
   * Gets all the banned member ID's
   * @returns {string[]} An array of Discord ID's
   */
  public getAll(): string[] {
    const rows = this.db.prepare(
      `SELECT discord_id FROM ${this.tableName}`
    ).all();
    const result = [];

    for (const row of rows) {
      result.push(row.discord_id);
    }

    return result;
  }

  /**
   * This lifts a ban
   */
  public pardon(id: string): boolean {
    const info = this.db.prepare(
      `DELETE FROM ${this.tableName} WHERE discord_id=?`
    ).run(id);

    return (info.changes > 0);
  }

  private init() {
    this.db.prepare(
      `CREATE TABLE IF NOT EXISTS ${this.tableName} (` +
      'discord_id text PRIMARY KEY NOT NULL' +
      ')'
    ).run();
  }
}
