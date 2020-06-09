/**
 * @LICENSE GPL-3.0
 * @author Dylan Hackworth <dhpf@pm.me>
 */
import { Bot } from "./Bot";
import { Message } from "discord.js";
import * as mc from "../minecraft";
import { AlreadyLinkedError, DBController, NoMcAccError } from "../db";

/**
 * These are all the regular commands
 */
export class Commands {
  private readonly bot: Bot;
  private readonly db: DBController;

  constructor(bot: Bot, db: DBController) {
    this.bot = bot;
    this.db = db;
  }

  /**
   * This is the help command it prints all the available commands
   */
  public async help(msg: Message) {
    const bot = this.bot;
    await msg.reply(
      "Available Commands:\n" +
      ` - ${bot.prefix} link <Minecraft player name> To associate your` +
      ` Discord account with your provided Minecraft account\n` +
      ` - ${bot.prefix} unlink\n` +
      ` - ${bot.prefix} help Display this help dialogue\n` +
      ` - ${bot.prefix} whoami For debugging purposes\n` +
      ` - ${bot.prefix} admin Display admin commands`
    );
  }


  /**
   * This is the link command it attempts to associate with a Discord
   * user's ID with the provided Minecraft account that the user gives.
   * @param {Message} msg Message to respond to
   * @param {string[]} args Args should look like this:
   * ["<bot prefix>", "link", "<minecraft player name"]
   */
  public async link(msg: Message, args: string[]) {
    // Make sure this command is being executed in a Discord server
    if (!msg.member)
      return;

    // This means they didn't provide a player name in the message:
    // args = ["<bot prefix>", "link", "<mc player name>" || undefined]
    if (args.length == 1) {
      await msg.reply(
        "Please provide a Minecraft player name " +
        `ie \`${this.bot.prefix} link dylan\``
      );
      return;
    }

    // This is where the function starts after sanity checking
    const playerName = args[2];

    try {
      const uuid = await mc.getUUID(playerName);

      if (uuid) {
        this.db.links.link(msg.author.id, uuid);
        await msg.reply("Linked.");
      } else {
        await msg.reply(`Failed to get UUID of "${playerName}"`)
      }

    } catch (err) {
      let errResponse: string;
      if (err instanceof AlreadyLinkedError) {
        switch (err.account) {
          case 'both':
            errResponse = 'Your Discord account is already linked with the' +
              ' provided Minecraft account';
            break;
          case 'discord':
            errResponse = 'Your Discord account is already linked with' +
              ' another Minecraft account';
            break;
          case 'minecraft':
            errResponse = 'The provided Minecraft account is already linked' +
              ' with another Discord account.';
            break;
        }
      } else {
        errResponse = `"${playerName}" is an invalid player name.`;
      }

      await msg.reply(errResponse);
    }
  }

  /**
   * This is the unlinkDiscordAcc command
   * @param {Message} msg Message to respond to
   * @param {string[]} args Possible iterations:
   *  * ["<bot prefix>", "unlink"]
   */
  public async unlink(msg: Message, args: string[]) {
    // Make sure they're talking in a guild
    if (!msg.member)
      return;

    // args = ["<bot prefix>", "unlink"]
    if (args.length == 2) {
      this.db.links.unlinkDiscordAcc(msg.author.id);
      await msg.reply("Unlinked.");
    } else {
      await msg.reply()
    }

  }

  /**
   * This is the whoami command
   * @param {Message} msg Message to respond to
   */
  public async whoami(msg: Message) {
    try {
      const uuid = this.db.links.getMcID(msg.author.id);
      const name = await mc.getName(uuid);

      await msg.reply(`You're linked as "${name}"`);

    } catch (err) {
      if (NoMcAccError)
        await msg.reply("You're not linked with any account.");
      else
        await msg.reply("Something went wrong.");
    }
  }
}
