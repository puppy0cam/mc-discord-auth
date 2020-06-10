import { Database } from "better-sqlite3";
import { v1 as uuid } from 'uuid';
import { AlreadyAuthCode } from "../errors";


export type AuthCodeProfile = {
  discordID: string;
  authCode: string;
  playerUUID: string;
}

export class AuthCodes {
  private readonly tableName = "auth_codes";

  constructor(private readonly db: Database) { this.init(); }

  /**
   * Gets the auth code associated with a given identifier
   */
  public getAuthCode(id: string): string | null {
    const row = this.db.prepare(
      `SELECT auth_code FROM ${this.tableName} WHERE discord_id=? ` +
      `OR minecraft_id=?`
    ).get(id, id);


    if (row)
      return row.auth_code;
    else
      return null;
  }

  public getAllAuthCodes(): AuthCodeProfile[] {
    const rows = this.db.prepare(
      `SELECT * FROM ${this.tableName}`
    ).all();
    const result: AuthCodeProfile[] = [];

    for (const row of rows) {
      result.push({
        discordID: row.discord_id,
        authCode: row.auth_code,
        playerUUID: row.minecraft_id
      });
    }


    return result;
  }

  /**
   * Gets the auth code associated with a given
   */
  public getUUID(discordID: string): string | null {
    const row = this.db.prepare(
      `SELECT minecraft_id FROM ${this.tableName} WHERE discord_id=?`
    ).get(discordID);

    if (row)
      return row.minecraft_id;
    else
      return null;
  }

  /**
   * Checks to see if a given auth code is correct, it also deletes it from
   * the table
   */
  public authorizedCode(discordID: string, authCode: string): string | null {
    const code = this.getAuthCode(discordID);

    if (code == authCode) {
      const playerUUID = this.getUUID(discordID);

      this.db.prepare(
        `DELETE FROM ${this.tableName} WHERE discord_id=?`
      ).run(discordID);

      return playerUUID;
    } else
      return null;
  }

  public hasAuthCode(discordID: string): boolean {
    return this.getAuthCode(discordID) != null;
  }

  /**
   * Generates a new auth code for a given Discord user
   */
  public newAuthCode(discordID: string, playerUUID: string): string {
    const authCode = uuid().split('-')[0];
    const alreadyHasCode = this.hasAuthCode(discordID);

    if (alreadyHasCode) {
      throw new AlreadyAuthCode();
    }

    this.db.prepare(
      `INSERT INTO ${this.tableName} (discord_id,auth_code,minecraft_id) VALUES (?,?,?)`
    ).run(discordID, authCode, playerUUID);

    return authCode;
  }

  private init() {
    this.db.prepare(
      `CREATE TABLE IF NOT EXISTS ${this.tableName} (` +
      "discord_id text UNIQUE NOT NULL," +
      "minecraft_id text NOT NULL," +
      "auth_code text UNIQUE NOT NULL" +
      ")"
    ).run();
  }
}
