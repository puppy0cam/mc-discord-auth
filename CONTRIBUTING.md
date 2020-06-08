This application is pretty simple all it does is interfaces with Discord
using a Discord bot to add new links between Discord accounts and Minecraft
accounts. It then interfaces with Minecraft servers, a Minecraft server will
send a POST request to /isPlayerValid endpoint providing a player's UUID
which then checks the database if it's "linked" with a Discord account, if
it is then it responds true else it responds false.

## [Discord Bot](./src/discord/Bot.ts)
The Discord bot has two public methods start and isTierThree. The start
method must be called above anything else. Once it is the WebServer can call 
"isTierThree" to authenticate that a certain user is ready to play on the
Minecraft server. All other uncovered methods are heavily commented just
review the Bot.ts file in src/discord.

## [WebServer](./src/webserver/WebServer.ts)
The WebServer has one endpoint which is "isValidPlayer" it intakes a POST
request with the following body. 

### Request Body
| Attribute | Type   | Description             |
|-----------|--------|-------------------------|
| player_id | string | The Minecraft player ID |

The player_id is the Minecraft player UUID stripped of all the dashes. The
server will provide the following response if everything went alright
, otherwise an error may occur. Make sure that all provided headers are given:

Required Headers:
 1. Content-Type: `application/json`
 2. Authorization: `Bearer <webserver token>` 

### [Response Body](./src/webserver/responses.ts)
| Attribute | Type    | Description                                      |
|-----------|---------|--------------------------------------------------|
| valid     | boolean | Whether or not the given player is ready to play |

The valid attribute is a boolean which represents whether the player can
play on the Minecraft server. This will always return a boolean whether or
not there was an issue getting the member associated with the provided
player ID.

### [Errors](./src/webserver/errors.ts)

#### NoBodyError
```json
{
  "errcode": "NO_BODY",
  "message": "There wasn't a body in this request"
}
```

This occurs when a body is not provided.

### NoPlayerID
```json
{
  "errcode": "NO_PLAYER_ID",
  "message": "There wasn't a player ID provided"
}
```

NO_PLAYER_ID occurrs when the "player_id" attribute is not provided.

### PlayerIDType
```json
{
  "errcode": "PLAYER_ID_TYPE",
  "message": "The provided player ID wasn't a string"
}
```
PLAYER_ID_TYPE occurs when the "player_id" attribute isn't a string

### internalError
```json
{
  "errcode": "INTERNAL_ERROR",
  "message": "An internal error occurred"
}
```

This isn't used, but it's reserved when something has gone terribly wrong.
