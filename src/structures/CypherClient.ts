import { SapphireClient, container } from '@sapphire/framework'
import { ActivityTypes } from 'discord.js/typings/enums'
import { Jukebox } from './Jukebox'

declare module '@sapphire/pieces' {
    interface Container {
        jukebox: Jukebox
    }
}

export class CypherClient extends SapphireClient {
    public constructor() {
        super({
            intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_VOICE_STATES'],
            presence: {
                activities: [
                    {
                        name: 'Here comes the party!',
                        type: ActivityTypes.WATCHING,
                    },
                ],
            },
        })
    }

    public override async login(token?: string) {
        container.jukebox = new Jukebox()
        return super.login(token)
    }
}
