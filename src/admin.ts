import { Client, VoiceChannel } from "discord.js";
import { Command } from "./commandProcessor.js";
import * as CMD from "./commands.json";
import * as ROLES from "./roles.json"
import { CommandUser } from "./interfaces.js";


export class Admin implements CommandUser {

    private client: Client
    private allowedRoles = ROLES.ADMIN_ROLE_KEY
    private office_meeting = false
    private meeting_id = ""
    private meeting_members = new Array<string>()
    private voice_channel: VoiceChannel | null = null

    constructor(bot: Client) {
        this.client = bot
    }

    RunCommand(cmd: Command): boolean {
        let cmd_was_run = false
        let admin_role = cmd.member?.guild.roles.cache.find(role => role.name === this.allowedRoles)?.id


        if (admin_role && cmd.member?.roles.cache.has(admin_role)) {
            switch (cmd.name) {
                case CMD.officeInvite: {
                    cmd_was_run = true
                    this.InviteToOffice(cmd, ROLES.OFFICE_CHAT_ROLE)
                    break
                }
                case CMD.logOff: {
                    cmd_was_run = true
                    this.LogOff()
                    break
                }
                case CMD.endMeeting: {
                    cmd_was_run = true
                    this.EndMeeting(cmd, ROLES.OFFICE_CHAT_ROLE)
                    break
                }
                case CMD.clear: {
                    cmd_was_run = true
                    this.clear(cmd)
                    break
                }
            }
        }
        else {
            console.log("couldn't run command")
        }

        return cmd_was_run
    }

    isActiveMeeting(): boolean {
        return this.office_meeting
    }

    private InviteToOffice(cmd: Command, invite_role: string): void {
        let channel = cmd.member?.voice.channel
        if (channel) {
            let guild_channel = this.client.guilds.cache.get(cmd.member!!.guild.id)?.channels.cache.get(channel.id)
            if (guild_channel && !guild_channel.isText()) {
                let voice_channel = (guild_channel as VoiceChannel)
                this.meeting_id = voice_channel.id
                this.office_meeting = true
                this.voice_channel = voice_channel
                voice_channel.join().then( connection => {
                    connection.voice?.setMute(true)
                    connection.voice?.setDeaf(true)
                })
                this.sendInvites(voice_channel, cmd.parameters, invite_role)
            }
        }
    }

    private EndMeeting(cmd: Command, role: string) {
        const meeting_channel = cmd.member?.guild.channels.cache.find(channel => channel.id === this.meeting_id)
        if (meeting_channel) {
            const office_role = meeting_channel.guild.roles.cache.find(r => r.name === role)

            for (let member of this.meeting_members) {
                const member_in_meeting = meeting_channel.guild.members.cache.find(m => member.includes(m.id))
                member_in_meeting?.voice.kick("meeting has ended").catch(console.error)
                member_in_meeting?.roles.remove(office_role!!).catch(console.error)
            }
            
            // resets all varibles related to keeping track of the meeting
            this.meeting_id = ""
            this.office_meeting = false
            this.meeting_members.splice(0, this.meeting_members.length)
            this.voice_channel?.leave()
        }
    }

    private sendInvites(channel: VoiceChannel, members: string[], role: string) {
        for(let member of members) {
            this.meeting_members.push(member)
            const office_member = channel.guild.members.cache.find(m => member.includes(m.id))
            const office_role = channel.guild.roles.cache.find(r => r.name === role)
            if (office_member) {
                channel.createInvite()
                .then((invite) => {
                    try {
                        office_member.roles.add(office_role!!).catch(console.error)
                    }
                    catch {
                        console.log("couldn't add role")
                    }
                    office_member.send(`please join the meeting ${invite.url}`)
                })
                .catch(console.error)


            }
        }
    }

    private LogOff() {
        this.voice_channel?.leave()
        this.client.destroy()
    }

    private clear(cmd: Command) {
        const channel = cmd.member?.guild.channels.cache.find(c => c.id === cmd.channel_id)

        if (channel?.isText()) {
            
        }
    }
}