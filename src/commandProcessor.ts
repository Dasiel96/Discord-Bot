import { GuildMember, Message } from "discord.js"

export interface Command {
    name: string,
    parameters: string[],
    member: GuildMember | null,
    channel_id: string

}

export class CommandProcessor {
    Process(cmd: Message): Command {
        let cmd_parts: string[]

        cmd_parts = (cmd as Message).content.split(" ")

        const command: Command = {
            name: cmd_parts[0],
            parameters: cmd_parts.slice(1),
            member: cmd.member,
            channel_id: cmd.channel.id
        }

        return command
    }
}