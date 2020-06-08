/**
 * Database controller class
 * @license GNU GPLv3
 * @author Dylan Hackworth <dhpf@pm.me>
 */
import sql from 'better-sqlite3';
import mkdirp from 'mkdirp';
import fs from 'fs';
import { DBConfig } from "../common/Config";
import { LinksTable } from "./tables/links";
import { AltsTable } from "./tables/alts";


/**
 * This class controls the SQLite3 database currently it only manages one
 * table which is "account_links" it makes sure that links don't already
 * exist when creating a new one and also keeping them valid.
 */
export class DBController {
  public static readonly rootDir = `${process.cwd()}/config`;
  public static readonly defPath = `${DBController.rootDir}/accounts.db`;

  private readonly db: sql.Database;
  public readonly alts: AltsTable;
  public readonly links: LinksTable;

  constructor(config: DBConfig) {
    if (!fs.existsSync(DBController.rootDir))
      mkdirp.sync(DBController.rootDir);

    this.db = new sql(config.location);
    this.links = new LinksTable(this.db);
    this.alts = new AltsTable(this.db);
  }

}
