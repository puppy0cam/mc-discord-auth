/**
 * This is the Bot module it interfaces with Discord to communicate with
 * users. Everything related to Discord can be found in this file.
 * @license GPLv3
 * @author Dylan Hackworth <dhpf@pm.me>
 */
import type { GuildMember, Message } from 'discord.js';
import { Client } from 'discord.js';
import * as mc from '../minecraft';
import { AlreadyLinkedError, DBController, NoMcAccError } from '../db';
import { DiscordConfig } from "../common/Config";


/**
 * This is the Discord bot that communicates with Discord users. To start
 * it call the start() method of a Bot object.
 */
export class Bot {
  private readonly client: Client;
  private readonly guild: string;
  private readonly db: DBController;
  private readonly prefix: string;
  private readonly whitelist: string[];
  private readonly token: string;


  constructor(db: DBController, config: DiscordConfig) {
    this.client = new Client();
    this.guild = config.guild_id;
    this.whitelist = config.roles;
    this.db = db;
    this.prefix = config.prefix;
    this.token = config.token;
  }

  /**
   * This method starts the bot
   * @returns {Promise<string>} The string is the token provided
   */
  public start(): Promise<string> {

    // This will allow us to listen to incoming Discord messages that the
    // bot can see, if the bot isn't in the channel then no messages are
    // emitted here.
    this.client.on('message', this.onMessage.bind(this));

    this.client.on('ready', () => {
      if (this.client.user)
        console.log("Bot: Ready as " + this.client.user.username)
    })

    // Finally login into the Discord API gateway to start receiving and
    // sending objects through the websocket.
    return this.client.login(this.token);
  }

  /**
   * This is our Message object listener when the bot retrieves a new
   * message in whatever channel it's in it is emitted here.
   * @param {Message} message The message object (see link for details)
   * @link https://discord.js.org/#/docs/main/stable/class/Message
   */
  private async onMessage(message: Message) {
    // First let's filter all the messages we don't want
    // We don't want bots & we don't want blank messages (ie images with no
    // caption)
    if (message.author.bot || message.content.length == 0)
      return;

    // Next let's see if they're communicating with our bot
    if (message.content.startsWith(this.prefix)) {
      // args = ["<bot prefix>", "<command name>" || undefined]
      const args = message.content.split(' ');

      switch (args[1]) {
        case 'link':
          await this.link(message, args);
          break;
        case 'unlink':
          await this.unlink(message);
          break;
        case 'whoami':
          await this.whoami(message);
          break;
        case 'help':
        default:
          await this.help(message);
      }
    }
  }

  /**
   * This is the help command it prints all the available commands
   * @param {Message} msg
   */
  private async help(msg: Message) {
    await msg.reply(
      "Available Commands:\n" +
      ` - ${this.prefix} link <Minecraft player name> To associate your` +
      ` Discord account with your provided Minecraft account\n` +
      ` - ${this.prefix} unlink\n` +
      ` - ${this.prefix} help\n` +
      ` - ${this.prefix} whoami For debugging purposes`
    );
  }

  /**
   * This is the link command it attempts to associate with a Discord
   * user's ID with the provided Minecraft account that the user gives.
   * @param {Message} msg Message to respond to
   * @param {string[]} args Args should look like this:
   * ["<bot prefix>", "link", "<minecraft player name"]
   */
  private async link(msg: Message, args: string[]) {
    // Make sure this command is being executed in a Discord server
    if (!msg.member)
      return;

    // Let's make sure they're a tier 3 member
    const isTierThree = this.isTierThree(msg.member);

    if (!isTierThree)
      return;


    // This means they didn't provide a player name in the message:
    // args = ["<bot prefix>", "link", "<mc player name>" || undefined]
    if (args.length == 1) {
      await msg.reply(
        "Please provide a Minecraft player name " +
        `ie \`${this.prefix} link dylan\``
      );
      return;
    }

    // This is where the function starts after sanity checking
    const playerName = args[2];

    try {
      const uuid = await mc.getUUID(playerName);

      if (uuid) {
        this.db.link(msg.author.id, uuid);
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
   * This is the unlink command
   * @param {Message} msg Message to respond to
   */
  private async unlink(msg: Message) {
    const unlinked = this.db.unlink(msg.author.id);

    if (unlinked)
      await msg.reply("You've been unlinked.");
    else
      await msg.reply("You were never linked with an account.");
  }

  private async whoami(msg: Message) {
    try {
      const uuid = this.db.getMcID(msg.author.id);
      const name = await mc.getName(uuid);

      await msg.reply(`You're linked as "${name}"`);

    } catch (err) {
      if (NoMcAccError)
        await msg.reply("You're not linked with any account.");
      else
        await msg.reply("Something went wrong.");
    }
  }

  /**
   * This gets the GuildMember object of the provided ID.
   * @param {string} id The user's ID
   * @returns {GuildMember | null}
   * @throws {Error} if it failed getting the Guild that the bot should be
   * serving.
   */
  private resolveMember(id: string): GuildMember | null {
    const guild = this.client.guilds.cache.get(this.guild);

    if (guild)
      return guild.member(id);
    else
      throw new Error("Internal error occurred while fetching guild.");
  }

  /**
   * This checks if the Discord server member has the tier three role
   * @param {GuildMember | string} resolvable The server member or their ID.
   * @returns {Promise<boolean>}
   * @throws {Error} if it can't get the guild that the bot is serving.
   */
  public async isTierThree(resolvable: GuildMember | string): Promise<boolean> {
    let member: GuildMember | null;

    if (typeof resolvable == 'string') {
      member = this.resolveMember(resolvable);
    } else {
      member = resolvable;
    }

    if (member == null)
      return false;

    for (const roleID of member.roles.cache.keys()) {
      let isWhitelisted = this.whitelist.includes(roleID);

      if (isWhitelisted) {
        return true;
      }
    }
    return false;
  }
}

