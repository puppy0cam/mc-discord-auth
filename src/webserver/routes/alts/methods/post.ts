import { NextFunction, Request, Response } from "express";
import { noBodyError, noPlayerName, playerNameType } from "../../../errors";
import {
  altAlreadyAdded,
  ownerType,
  noOwner,
} from "../errors";
import { WebServer } from "../../../WebServer";
import * as mc from "../../../../minecraft";


export async function postReq(req: Request, res: Response) {
  // @ts-ignore
  const reqID = req['id'];
  // @ts-ignore
  const playerName: string = req['player_name'];
  // @ts-ignore
  const owner: string = req['owner'];
  // @ts-ignore
  const webServer: WebServer = req['webserver'];
  const playerUUID: string = await mc.getUUID(playerName);

  try {
    const isAdded = webServer.db.alts.addAnAlt(
      owner,
      playerUUID,
      playerName
    );
    console.log(
      `Response for "${reqID}"\n`,
      isAdded ? "Added new alt" : "Something went wrong."
    );
    res.status(200);
    res.end();
  } catch (err) {
    res.status(401);
    res.send(altAlreadyAdded);
    console.log(`Response for "${reqID}"\n`, altAlreadyAdded);
    res.end();
  }

}


export function checkPostReq(req: Request, res: Response, next: NextFunction) {
  // @ts-ignore
  const reqID = req['id'];
  const body = req.body;

  res.setHeader('Content-Type', 'application/json');

  if (!body) {
    res.status(401);
    res.send(noBodyError);
    console.log(`Response for "${reqID}"\n`, noBodyError);
    res.end();
    return;
  }

  const playerName = req.body['player_name'];

  if (!playerName) {
    res.status(401);
    res.send(noPlayerName);
    console.log(`Response for "${reqID}"\n`, noPlayerName);
    res.end();
    return;
  } else if (typeof playerName != 'string') {
    res.status(401);
    res.send(playerNameType);
    console.log(`Response for "${reqID}"\n`, playerNameType);
    res.end();
    return;
  }

  const owner = req.body['owner'];

  if (!owner) {
    res.status(401);
    res.send(noOwner);
    console.log(`Response for "${reqID}"\n`, noOwner);
    res.end()
    return;
  } else if (typeof owner != 'string') {
    res.status(401);
    res.send(ownerType);
    console.log(`Response for "${reqID}"\n`, ownerType);
    res.end();
    return;
  }

  // @ts-ignore
  req['player_name'] = playerName;
  // @ts-ignore
  req['owner'] = owner;

  next();
}
