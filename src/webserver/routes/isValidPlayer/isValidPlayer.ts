/**
 * @LICENSE GPL-3.0
 * @author Dylan Hackworth <dhpf@pm.me>
 */
import * as express from 'express';
import { isNotValid, authCodeRes, isValid } from "./responses";
import { NextFunction, Request, Response } from "express";
import { noBodyError } from "../../errors";
import { noPlayerID, playerIDType } from "../../errors";
import { WebServer } from "../../WebServer";


export const isValidPlayer = express.Router();

isValidPlayer.post('/isValidPlayer', express.json());

isValidPlayer.use('/isValidPlayer', validateBody);

/**
 * POST /isValidPlayer
 * This is the isValidPlayer endpoint handler.
 */
isValidPlayer.post('/isValidPlayer', async (req: Request, res: Response) => {
  // @ts-ignore
  const reqID: string = req['id'];
  // @ts-ignore
  const playerUUID: string = req['player_id'];
  // @ts-ignore
  const webserver: WebServer = req['webserver'];

  // Let's check if they're a valid alt account
  const isAnAlt = webserver.db.alts.isAnAlt(playerUUID);

  res.status(200);

  if (isAnAlt) {
    const body: isValid = { valid: true };
    res.send(body);
    console.log(`Response for "${reqID}" (ALT)\n`, body);
    res.end();
    return;
  }

  try {
    const linkedDiscord = webserver.db.links.getDiscordID(playerUUID);

    if (linkedDiscord) {
      // let's see if they're a verified member
      const body = webserver.discord.isValidMember(linkedDiscord);
      console.log(`Response for "${reqID}"\n`, body);
      res.send(body);
      res.end();
    } else {
      // let's see if this person has an auth code
      const authCode = webserver.db.auth.getAuthCode(playerUUID);

      if (authCode) {
        const body: authCodeRes = {
          reason: 'auth_code',
          valid: false,
          auth_code: authCode
        };
        res.send(body);
        console.log(`Response for "${reqID}"\n`, body);
        res.end();
      } else {
        const body: isNotValid = {
          reason: 'no_link',
          valid: false
        };
        console.log(`Response for "${reqID}"\n`, body);
        res.send(body);
        res.end();
      }
    }
  } catch (err) {
    res.status(500);
    res.send();
    console.log(`Error while handling request "${reqID}"\n`, err);
    res.end();
  }
});

/**
 * This checks the integrity of the body in a given request.
 */
function validateBody(req: Request, res: Response, next: NextFunction) {
  // @ts-ignore
  const reqID = req['id'];

  console.log(
    `Validating Body for Request "${reqID}"`
  );

  if (req.body == undefined) {
    res.status(400);
    res.send(noBodyError);
    res.end();
  }

  const playerUUID = req.body['player_id'];

  res.setHeader('Content-Type', 'application/json');

  if (playerUUID == undefined) {
    res.status(400);
    res.send(noPlayerID);
    console.log(`Response for "${reqID}"\n`, noPlayerID);
    res.end();
    return;
  } else if (typeof playerUUID != 'string') {
    res.status(400);
    res.send(playerIDType);
    console.log(`Response for "${reqID}"\n`, playerIDType);
    res.end();
    return;
  }

  // @ts-ignore
  req['player_id'] = playerUUID;
  console.log(
    `Validated Request `
  )
  next();
}
