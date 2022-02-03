import * as dotenv from 'dotenv'
import { generateDependencyReport } from '@discordjs/voice'
import { BoombotClient } from './structures/BoombotClient'

console.log(generateDependencyReport())

if (process.env.NODE_ENV !== 'production') {
    dotenv.config()
}

const BOT_TOKEN = process.env.BOT_TOKEN

if (!BOT_TOKEN) {
    throw new Error('Environment variable BOT_TOKEN is missing.')
}

const client = new BoombotClient()

client.login(BOT_TOKEN)
