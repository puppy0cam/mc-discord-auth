This application is pretty simple all it does is interfaces with Discord
using a Discord bot to add new links between Discord accounts and Minecraft
accounts. It then interfaces with Minecraft servers, a Minecraft server will
send a POST request to /isPlayerValid endpoint providing a player's UUID
which then checks the database if it's "linked" with a Discord account, if
it is then it responds true else it responds false.

## [Discord Bot](./src/discord/Bot.ts)
The Discord bot has two public methods start and isValidMember. The start
method must be called above anything else. Once it is the WebServer can call 
"isValidMember" to authenticate that a certain user is ready to play on the
Minecraft server. All other uncovered methods are heavily commented just
review the Bot.ts file in src/discord.

## [WebServer](./src/webserver/WebServer.ts)
The WebServer interfaces with a Minecraft server to validate each player
that joins the game. Administrators of the Minecraft server can also add
"alt" accounts which will enforce a player's acceptance when they join the
game.

## WebServer Endpoints
See [Endpoints.md](./docs/Endpoints.md)

## Version Scheme:
`x.y.z`
 - x: Major update, production should update
 - y: A bug was patched, production can update
 - z: A small patch was made, production doesn't need to update
