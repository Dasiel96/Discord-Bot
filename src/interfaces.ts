import { Command } from "./commandProcessor";

export interface CommandUser {
    RunCommand(cmd: Command): boolean
}