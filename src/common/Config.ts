/**
 * config.yaml Config handler class
 * @license GPL-3.0
 * @author Dylan Hackworth <dhpf@pm.me>
 */
import fs from 'fs';
import yaml from 'yaml';
import mkdirp from 'mkdirp';
import { v4 as uuid } from 'uuid';
import { DBController } from "../db";


/**
 * @typedef {Object} DBConfig
 * @property {string} location Location to the SQLite3 database
 */
export type DBConfig = {
  location: string;
}

/**
 * @typedef {Object} DiscordConfig
 * @property {string} guild_id The ID of the Discord server to serve
 * @property {string} prefix To talk to the bot every message must start
 * with this
 * @property {string} roles The whitelisted roles that can are authorized
 * to use the bot and join the Minecraft server
 * @property {string} admin_roles The administrators of the bot
 * @property {string} token The Discord bot access token
 */
export type DiscordConfig = {
  guild_id: string;
  prefix: string;
  roles: string[];
  admin_roles: string[];
  token: string;
  minecraft_connection_address: string;
}

/**
 * @typedef {Object} WebServerConfig
 * @property {number} port WebServer port to listen to
 * @property {string} token The access token this allows the plugin to
 * communicate with this webserver. (Anything can go here)
 */
export type WebServerConfig = {
  port: number;
  token: string;
}

/**
 * This class defines what config.yaml should be. To get the config use
 * Config.getConfig, if it doesn't already exist then genConfig will be
 * called and return a default configuration.
 */
export class Config {
  public static readonly rootDir = `${process.cwd()}/config`;
  public static readonly defPath = `${Config.rootDir}/config.yaml`;

  public readonly db: DBConfig;
  public readonly discord: DiscordConfig;
  public readonly webserver: WebServerConfig;

  constructor() {
    // This is the default configuration attributes
    this.db = {
      location: DBController.defPath,
    }
    this.discord = {
      token: '',
      prefix: '!minecraft',
      roles: ['role id 1', 'role id 2', 'role id 3'],
      admin_roles: ['role id 1', 'role id 2'],
      guild_id: '',
      minecraft_connection_address: 'example.org',
    };
    this.webserver = {
      token: uuid(),
      port: 3001,
    };
  }

  /**
   * @param {string | undefined} location Optional location of a
   * configuration file. Otherwise it results in default.
   */
  public static getConfig(location?: string): Config {
    if (fs.existsSync(Config.defPath)) {
      const buffer = fs.readFileSync(location || Config.defPath);
      return yaml.parse(
        buffer.toString()
      ) as Config;
    } else
      return Config.genConfig(location);
  }

  /**
   * @param {string | undefined} location Optional location of a
   * configuration file. Otherwise it results in default.
   */
  public static genConfig(location?: string): Config {
    const config = new Config();

    if (!fs.existsSync(Config.rootDir))
      mkdirp.sync(Config.rootDir);


    fs.writeFileSync(
      location || Config.defPath,
      yaml.stringify(config)
    );

    console.log(
      "Config: Default config generated, be sure to configure it before" +
      " continuing"
    );

    return config;
  }
}
