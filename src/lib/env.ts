import * as dotenv from 'dotenv'

if (process.env.NODE_ENV !== 'production') {
    dotenv.config()
}

export function getGuildIds() {
    try {
        const guildIds = JSON.parse(process.env.GUILD_IDS || '[]')
        return Array.isArray(guildIds) ? guildIds : []
    } catch (error) {
        console.error('Failed to parse GUILD_IDS!')
        return []
    }
}
