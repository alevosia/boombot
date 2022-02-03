import * as dotenv from 'dotenv'
import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'
import { getGuildIds } from './env'

dotenv.config()

export async function getCommands(isGlobal?: boolean) {
    const BOT_TOKEN = process.env.BOT_TOKEN
    const CLIENT_ID = process.env.CLIENT_ID
    const GUILD_IDS = getGuildIds()

    if (!BOT_TOKEN || !CLIENT_ID || !GUILD_IDS) {
        throw new Error(
            'Environment variable BOT_TOKEN, CLIENT_ID or GUILD_IDS is missing.'
        )
    }

    const rest = new REST({ version: '9' }).setToken(BOT_TOKEN)

    const commands = await rest.get(
        isGlobal
            ? Routes.applicationCommands(CLIENT_ID)
            : Routes.applicationGuildCommands(CLIENT_ID, GUILD_IDS[0])
    )

    console.log(commands)
}

export async function deleteCommand(id: string, isGlobal?: boolean) {
    const BOT_TOKEN = process.env.BOT_TOKEN
    const CLIENT_ID = process.env.CLIENT_ID
    const GUILD_IDS = getGuildIds()

    if (!BOT_TOKEN || !CLIENT_ID || !GUILD_IDS) {
        throw new Error(
            'Environment variable BOT_TOKEN, CLIENT_ID or GUILD_IDS is missing.'
        )
    }
    const rest = new REST({ version: '9' }).setToken(BOT_TOKEN)

    const response = await rest.delete(
        isGlobal
            ? Routes.applicationCommand(CLIENT_ID, id)
            : Routes.applicationGuildCommand(CLIENT_ID, GUILD_IDS[0], id)
    )

    console.log(response)
}

export async function deleteAllCommands(isGlobal?: boolean) {
    const BOT_TOKEN = process.env.BOT_TOKEN
    const CLIENT_ID = process.env.CLIENT_ID
    const GUILD_IDS = getGuildIds()

    if (!BOT_TOKEN || !CLIENT_ID || !GUILD_IDS) {
        throw new Error(
            'Environment variable BOT_TOKEN, CLIENT_ID or GUILD_IDS is missing.'
        )
    }
    const rest = new REST({ version: '9' }).setToken(BOT_TOKEN)

    const response = await rest.put(
        isGlobal
            ? Routes.applicationCommands(CLIENT_ID)
            : Routes.applicationGuildCommands(CLIENT_ID, GUILD_IDS[0]),
        {
            body: [],
        }
    )

    console.log(response)
}
