/**
 * This module interfaces with Minecraft servers, servers can call the
 * "isPlayerValid" POST endpoint to see if a certain player (provided with
 * a UUID) is valid
 * @LICENSE GPL-3.0
 * @author Dylan Hackworth <dhpf@pm.me>
 */
import express, { Express, NextFunction, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { WebServerConfig } from "../common/Config";
import { Bot } from "../discord/Bot";
import { DBController } from "../db";
import { isValidPlayer } from "./routes/isValidPlayer/isValidPlayer";
import { altsRoute } from "./routes/alts/alts";


/**
 * This is the WebServer it first authenticates each request that comes in
 * with the checkAuth object method. Then it validates all the bodies of
 * each request and finally gets the results with the isValidPlayer method.
 */
export class WebServer {
  public readonly db: DBController;
  public readonly discord: Bot;
  private readonly app: Express;
  private readonly port: number;
  private readonly token: string;


  constructor(discord: Bot, db: DBController, config: WebServerConfig) {
    this.app = express();
    this.db = db;
    this.discord = discord;
    this.port = config.port;
    this.token = config.token;
  }

  public start() {
    this.app.listen(this.port);

    console.log("WebServer: Listening on port " + this.port);

    // Authorize every request
    this.app.use('/', this.checkAuth.bind(this));

    // GET, POST, DELETE /alts

    // Parse incoming bodies
    this.app.use('/', express.json())

    this.app.use('/', altsRoute);

    // POST /isValidPlayer

    // Parse incoming bodies
    this.app.use('/', express.json());

    this.app.use('/', isValidPlayer);
  }

  /**
   * This makes sure that the client communicating with this webserver is
   * authorized to do so.
   * @param req
   * @param res
   * @param next
   */
  private checkAuth(req: Request, res: Response, next: NextFunction) {
    const auth = req.header('Authorization');
    const reqID = uuid();
    // @ts-ignore
    req['id'] = reqID;

    console.log(
      `Incoming Request "${reqID}"\n` +
      ` - Endpoint: [${req.method}] ${req.path}\n` +
      ` - User-Agent: ${req.header('User-Agent')}\n` +
      ` - Content-Type: ${req.header('Content-Type')}`
    )

    if (!auth) {
      res.status(203);
      res.end();
      return;
    }

    // auth = "Bearer <token || undefined>"
    const authSplit = auth.split(' ');
    if (authSplit.length == 1) {
      res.status(203);
      res.end();
      return;
    }

    const token = authSplit[1];

    if (token == this.token) {
      // @ts-ignore
      req['webserver'] = this;
      next();
    } else {
      res.status(401);
      res.end();
      return;
    }
  }
}
