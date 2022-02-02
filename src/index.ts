import * as dotenv from 'dotenv'
import { SapphireClient } from '@sapphire/framework'
import { generateDependencyReport } from '@discordjs/voice'

console.log(generateDependencyReport())

if (process.env.NODE_ENV !== 'production') {
    dotenv.config()
}

const BOT_TOKEN = process.env.BOT_TOKEN

if (!BOT_TOKEN) {
    throw new Error('Environment variable BOT_TOKEN is missing.')
}

const client = new SapphireClient({
    intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_VOICE_STATES'],
})

client.login(BOT_TOKEN)
