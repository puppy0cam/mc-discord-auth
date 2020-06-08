import fs from 'fs';
import yaml from 'yaml';
import mkdirp from 'mkdirp';
import { v4 as uuid } from 'uuid';
import { DBController } from "../db";


export type DBConfig = {
  location: string;
}

export type DiscordConfig = {
  token: string;
  prefix: string;
}

export type WebServerConfig = {
  port: number;
  token: string;
}

export class Config {
  public static readonly rootDir = `${process.cwd()}/config`;
  public static readonly defPath = `${Config.rootDir}/config.yaml`;

  public readonly db: DBConfig;
  public readonly discord: DiscordConfig;
  public readonly webserver: WebServerConfig;

  constructor() {
    this.db = {
      location: DBController.defPath,
    }
    this.discord = {
      token: '',
      prefix: '!minecraft',
    };
    this.webserver = {
      token: uuid(),
      port: 3001,
    };
  }

  public static getConfig(location?: string): Config {
    if (!fs.existsSync(Config.defPath)) {
      const buffer = fs.readFileSync(location || Config.defPath);
      return yaml.parse(
        buffer.toString()
      ) as Config;
    } else
      return Config.genConfig(location);
  }

  public static genConfig(location?: string): Config {
    const config = new Config();

    if (!fs.existsSync(Config.rootDir))
      mkdirp.sync(Config.rootDir);


    fs.writeFileSync(
      location || Config.defPath,
      yaml.stringify(config)
    );

    console.log(
      "Default config generated, be sure to configure it before continuing"
    );

    return config;
  }
}
