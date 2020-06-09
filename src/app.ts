/**
 * @LICENSE GPL-3.0
 * @author Dylan Hackworth <dhpf@pm.me>
 */
import { Bot } from "./discord/Bot";
import { DBController } from "./db";
import { WebServer } from "./webserver/WebServer";
import { Config } from "./common/Config";


/**
 * This initializes the config.yaml file
 * @param {string | undefined} location Optional config location
 */
function init(location?: string) {
  Config.genConfig(location);
}

/**
 * This starts mc-discord-auth
 * @param {string | undefined} location Optional config location
 */
async function start(location?: string) {
  const config = Config.getConfig(location);

  // Start up the database
  const db = new DBController(config.db);

  // Start up Discord
  const discordBot = new Bot(db, config.discord);
  await discordBot.start();

  // Start up the webserver
  const webServer = new WebServer(discordBot, db, config.webserver);
  webServer.start();
}

function main() {
  const args = process.argv;

  // Get optional config path
  const configPath = process.env['CONFIG_PATH'];

  if (args.includes('--INIT'))
    init(configPath)
  else {
    start(configPath).catch(console.log);
  }
}

main();
