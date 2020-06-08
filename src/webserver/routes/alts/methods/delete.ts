import { NextFunction, Request, Response } from "express";
import { noBodyError, noPlayerName, playerNameType } from "../../../errors";
import { WebServer } from "../../../WebServer";
import { isDeletedRes } from "../responses";

export async function delReq(req: Request, res: Response) {
  // @ts-ignore
  const reqID = req['id'];
  // @ts-ignore
  const playerName: string = req['player_name'];
  // @ts-ignore
  const webServer: WebServer = req['webserver'];
  const isRemoved = webServer.db.alts.removeAnAlt(playerName);
  const response: isDeletedRes = {
    is_deleted: isRemoved
  };

  console.log(`Response for "${reqID}"\n`, response);

  res.status(200);
  res.send(response)
  res.end();
}

export function checkDelReq(req: Request, res: Response, next: NextFunction) {
  // @ts-ignore
  const reqID = req['id'];
  const body = req.body;

  res.setHeader('Content-Type', 'application/json')

  if (!body) {
    res.status(401);
    console.log(`Response for "${reqID}"\n`, noBodyError);
    res.send(noBodyError);
    res.end();
  }

  const playerName = body['player_name'];

  if (!playerName) {
    res.status(401);
    console.log(`Response for "${reqID}"\n`, noPlayerName);
    res.send(noPlayerName);
    res.end();
    return;
  } else if (typeof playerName != 'string') {
    res.status(401);
    console.log(`Response for "${reqID}"\n`, playerNameType);
    res.send(playerNameType);
    res.end();
    return;
  }

  // @ts-ignore
  req['player_name'] = playerName;

  next();
}
