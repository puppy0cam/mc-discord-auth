import { NextFunction, Request, Response } from "express";
import { WebServer } from "../../../WebServer";
import { ownerType, noOwner } from "../errors";

export async function getReq(req: Request, res: Response) {
  // @ts-ignore
  const reqID = req['id'];
  // @ts-ignore
  const owner = req['owner'];
  // @ts-ignore
  const webServer: WebServer = req['webserver'];

  // result is an array of player names owned by the owner
  const result = webServer.db.alts.getAlts(owner);
  const body = { alt_accs: result };

  console.log(`Response for "${reqID}"\n`, body);

  res.status(200);
  res.send(body);
  res.end();
}

export function checkGetReq(req: Request, res: Response, next: NextFunction, owner: any) {
  // @ts-ignore
  const reqID = req['id'];

  if (!owner) {
    res.status(401);
    console.log(`Response for "${reqID}"\n`, noOwner);
    res.send(noOwner);
    res.end();
    return;
  } else if (typeof owner != 'string') {
    res.status(401);
    console.log(`Response for "${reqID}"\n`, ownerType);
    res.send(ownerType);
    res.end();
    return;
  }

  // @ts-ignore
  req['owner'] = owner;

  next();
}
