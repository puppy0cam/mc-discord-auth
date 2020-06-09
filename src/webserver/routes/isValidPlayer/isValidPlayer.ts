import * as express from 'express';
import { isNotValid, isValid } from "./responses";
import { NoDiscordAccError } from "../../../db";
import { NextFunction, Request, Response } from "express";
import { noBodyError } from "../../errors";
import { noPlayerID, playerIDType } from "../../errors";
import { WebServer } from "../../WebServer";


export const isValidPlayer = express.Router();

isValidPlayer.post('/isValidPlayer', express.json());

isValidPlayer.use('/isValidPlayer', validateBody);

isValidPlayer.use('/isValidPlayer', async (req, res) => {
  // @ts-ignore
  const reqID: string = req['id'];
  // @ts-ignore
  const playerUUID: string = req['player_id'];
  // @ts-ignore
  const webserver: WebServer = req['webserver'];

  // Let's check if they're a valid alt account
  const isAnAlt = webserver.db.alts.isAnAlt(playerUUID);

  if (isAnAlt) {
    res.status(200);
    res.send(isValid);
    console.log(`Response for "${reqID}" (ALT)\n`, isValid);
    res.end();
    return;
  }

  try {
    const discordID = webserver.db.links.getDiscordID(playerUUID);
    const isAuthed = webserver.discord.isValidMember(discordID);
    const adminOnlyRn = webserver.discord.isMaintenanceMode();

    res.status(200);

    if (isAuthed) {
      res.send(isValid);
      console.log(`Response for "${reqID}"\n`, isValid);
      res.end();
    } else {
      const body: isNotValid = {
        valid: false,
        reason: adminOnlyRn ? "maintenance" : "no_role"
      };
      console.log(`Response for "${reqID}"\n`, body);
      res.send(body);
    }
    res.status(200);
    res.end();

  } catch (err) {
    let body: isNotValid = {
      valid: false,
      reason: 'no_link'
    };
    console.log(`Response for "${reqID}"\n`, body);
    if (err instanceof NoDiscordAccError) {
      res.status(200);
      res.send(body);
      res.end()
    } else {
      res.status(200);
      res.send(body);
      res.end();
    }
  }
});

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
