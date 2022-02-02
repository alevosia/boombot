import { SapphireClient, container } from '@sapphire/framework'
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
        })
    }

    public override async login(token?: string) {
        container.jukebox = new Jukebox()
        return super.login(token)
    }
}
