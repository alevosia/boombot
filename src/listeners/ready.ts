import { Listener } from '@sapphire/framework'
import type { Client } from 'discord.js'

export class ReadyListener extends Listener {
    public constructor(context: Listener.Context, options: Listener.Options) {
        super(context, {
            ...options,
            once: true,
            event: 'ready',
        })
    }

    public run(client: Client) {
        if (!client.user) return

        this.container.logger.info(
            `Successfully logged in as ${client.user.username}!`
        )
    }
}
