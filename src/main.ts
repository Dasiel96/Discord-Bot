import { Client } from "discord.js"
import { Admin } from "./admin"
import { CommandProcessor } from "./commandProcessor.js"
import * as CONFIG from "./config.json"
import * as COMMANDS from "./commands.json"
import * as ROLES from "./roles.json"

const CLIENT = new Client()
const ADMIN = new Admin(CLIENT)

const CMD_PROCESSOR = new CommandProcessor()

// contains all command objects ordered from most specific user level to least specific
// aka commands for admins, commands for mods, ..., commands for everyone
const CommandUserList = [
    ADMIN,
]

CLIENT.login(CONFIG.TOKEN_KEY)

const main = () => {

    CLIENT.on("message", (message) => {
        if (!message.author.bot) {
            const msg = CMD_PROCESSOR.Process(message)
            if (msg.name[0] === COMMANDS.COMMAND_PREFIX_KEY){
                for (let user of CommandUserList) {
                    if (user.RunCommand(msg)) {
                        break
                    }
                }
                
            }
        }
    })

    CLIENT.on("voiceStateUpdate", (oldState, newState) => {
        if (ADMIN.isActiveMeeting()) {
            let channel_id = newState.member?.voice.channelID
            if (!channel_id) {
                const office_chat_role = newState.member?.guild.roles.cache.find(role => role.name === ROLES.OFFICE_CHAT_ROLE)
                if (office_chat_role) {
                    newState.member?.roles.remove(office_chat_role).catch(console.error)
                }
            }
        }
    })
}

CLIENT.on("ready", () => {
    main()
})


