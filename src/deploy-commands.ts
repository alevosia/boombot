import * as dotenv from 'dotenv'
import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'

if (process.env.NODE_ENV !== 'production') {
    dotenv.config()
}

export async function getCommands(isGlobal?: boolean) {
    const BOT_TOKEN = process.env.BOT_TOKEN
    const CLIENT_ID = process.env.CLIENT_ID
    const GUILD_ID = process.env.GUILD_ID

    if (!BOT_TOKEN || !CLIENT_ID || !GUILD_ID) {
        throw new Error('Missing environment variables!')
    }

    const rest = new REST({ version: '9' }).setToken(BOT_TOKEN)

    try {
        const registeredCommands = await rest.get(
            isGlobal
                ? Routes.applicationCommands(CLIENT_ID)
                : Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID)
        )

        console.log({ isGlobal, registeredCommands })
    } catch (error) {
        console.error(error)
    }
}

export async function deleteCommands(isGlobal?: boolean) {
    const BOT_TOKEN = process.env.BOT_TOKEN
    const CLIENT_ID = process.env.CLIENT_ID
    const GUILD_ID = process.env.GUILD_ID

    if (!BOT_TOKEN || !CLIENT_ID || !GUILD_ID) {
        throw new Error('Missing environment variables!')
    }

    const rest = new REST({ version: '9' }).setToken(BOT_TOKEN)

    try {
        const ids = isGlobal
            ? await rest.get(Routes.applicationCommands(CLIENT_ID))
            : await rest.get(
                  Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID)
              )

        console.log({ ids })

        const response = await rest.put(
            isGlobal
                ? Routes.applicationCommands(CLIENT_ID)
                : Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: [] }
        )

        console.log({ response })

        console.log(
            `Successfully deleted all ${
                isGlobal ? 'global' : 'guild'
            } application commands.`
        )
    } catch (error) {
        console.error(error)
    }
}

// getCommands(true)
// deleteCommands(true)
