export type WebServerError = {
  errcode: string;
  message: string;
}

export const noBodyError: WebServerError = {
  errcode: "NO_BODY",
  message: "There wasn't a body in this request"
}

export const noPlayerID: WebServerError = {
  errcode: "NO_PLAYER_ID",
  message: "There wasn't a player ID provided"
}

export const playerIDType: WebServerError = {
  errcode: "PLAYER_ID_TYPE",
  message: "The provided player ID wasn't a string"
}

export const noPlayerName: WebServerError = {
  errcode: "NO_PLAYER_NAME",
  message: "A player name wasn't provided"
}

export const playerNameType: WebServerError = {
  errcode: "PLAYER_TYPE_ERROR",
  message: "The player name attribute was not provided as a string"
}


export const internalError: WebServerError = {
  "errcode": "INTERNAL_ERROR",
  "message": "An internal error occurred"
}
