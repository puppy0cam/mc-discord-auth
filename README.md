# MC Discord Authenticator Server
This Discord bot communicates with both Discord and a Minecraft server to
create an authentication whether it be a user has a certain role or that
they are even allowed on the Minecraft server.

LICENSE: [GNU GPLv3](./LICENSE)

## Setup
Install The Requirements:
 * [NodeJS](https://nodejs.org)

Run The Following Commands:
```shell script
# Install all the missing dependencies
npm install

# Run initial setup
npm run setup

# ... configure config/config.yaml
# Required:
# * Set the Discord bot token
# * Set the Discord server (guild_id)
# * Set the required Discord role (role_id)
# * Make sure the webserver port is valid

# Finally run start
npm start
```

## Notes
If you need to set a different location for the config.yaml simply add an
environment variable "CONFIG_PATH" to the new location.

Example Shell Script:
```shell script
export CONFIG_PATH="/path/to/config.yaml"

npm start
```
