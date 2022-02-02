import * as dotenv from 'dotenv'
import { SapphireClient } from '@sapphire/framework'
import { generateDependencyReport } from '@discordjs/voice'

console.log(generateDependencyReport())

if (process.env.NODE_ENV !== 'production') {
    dotenv.config()
}

const client = new SapphireClient({
    intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_VOICE_STATES'],
})

client.login(process.env.BOT_TOKEN)
