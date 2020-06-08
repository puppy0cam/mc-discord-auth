/**
 * Database controller class
 * @license GNU GPLv3
 * @author Dylan Hackworth <dhpf@pm.me>
 */
import sql from 'better-sqlite3';
import mkdirp from 'mkdirp';
import fs from 'fs';
import type { Snowflake } from "discord.js";
import { NoMcAccError, AlreadyLinkedError, NoDiscordAccError } from './errors';
import { DBConfig } from "../common/Config";


/**
 * This class controls the SQLite3 database currently it only manages one
 * table which is "account_links" it makes sure that links don't already
 * exist when creating a new one and also keeping them valid.
 */
export class DBController {
  public static readonly rootDir = `${process.cwd()}/config`;
  public static readonly defPath = `${DBController.rootDir}/accounts.db`;

  private readonly tableName = 'account_links';
  private readonly db: sql.Database;

  constructor(config: DBConfig) {
    if (!fs.existsSync(DBController.rootDir))
      mkdirp.sync(DBController.rootDir);

    this.db = new sql(config.location);
    this.init();
  }

  /**
   * This gets the Minecraft UUID that is associated with the given Discord ID.
   * @param {string} discordID Discord user ID.
   * @returns {string}
   * @throws {NoMcAccError} if the provided ID isn't associated with an MC
   * account.
   */
  public getMcID(discordID: Snowflake): string {
    const row = this.db.prepare(
      `SELECT minecraft FROM ${this.tableName} WHERE discord=?`,
    ).get(discordID);

    const uuid: string | undefined = row?.minecraft;

    if (uuid)
      return uuid;
    else
      throw new NoMcAccError();
  }

  /**
   * This fetches a Discord user ID associated with the provided Minecraft
   * account.
   * @param {string} uuid
   * @returns {string}
   * @throws {NoDiscordAccError} if the provided Minecraft player ID isn't
   * associated with a Discord account.
   */
  public getDiscordID(uuid: string): string {
    const row = this.db.prepare(
      `SELECT discord FROM ${this.tableName} WHERE minecraft=?`
    ).get(uuid);

    const discordID: string | undefined = row?.discord;

    if (discordID)
      return discordID;
    else
      throw new NoDiscordAccError();
  }

  public link(discordID: string, mcID: string) {
    const alreadyLinked = this.db.prepare(
      `SELECT * FROM ${this.tableName} WHERE discord=? OR minecraft=?`
    ).get(discordID, mcID);

    // This means a provided identifier is already linked with another account.
    if (alreadyLinked != undefined) {
      if (alreadyLinked.discord && alreadyLinked.minecraft) {
        throw new AlreadyLinkedError('both');
      } else if (alreadyLinked.discord) {
        throw new AlreadyLinkedError('discord');
      } else {
        throw new AlreadyLinkedError('minecraft');
      }
    }

    // If it passed the above sanity check then continue to link the two
    this.db.prepare(
      `INSERT INTO ${this.tableName} (discord, minecraft) VALUES (?,?)`
    ).run(discordID, mcID);
  }

  /**
   * Unlinks the provided Discord ID with anything it was linked with
   * @param {string} discordID
   * @returns {boolean} If it was successfully unlinked.
   */
  public unlink(discordID: string): boolean {
    const info = this.db.prepare(
      `DELETE FROM ${this.tableName} WHERE discord=?`
    ).run(discordID);

    return (info.changes > 0);
  }

  private init() {
    this.db.prepare(
      `CREATE TABLE IF NOT EXISTS ${this.tableName} (` +
      'minecraft text UNIQUE NOT NULL,' +
      'discord text PRIMARY KEY NOT NULL' +
      ')'
    ).run();
  }
}
