import { SapphireClient, container } from '@sapphire/framework'
import { Player } from 'discord-player'
import { TextChannel } from 'discord.js'
import { ActivityTypes } from 'discord.js/typings/enums'
import { getPlayingNowEmbed } from '../lib/embeds'
import { generateRandomEmoji } from '../lib/emoji'

declare module '@sapphire/pieces' {
    interface Container {
        jukebox: Player
    }
}

interface QueueMetadata {
    channel: TextChannel
}

function overrideIsSomething(override: unknown): override is QueueMetadata {
    function isSomethingLike(
        given: unknown
    ): given is Partial<Record<keyof QueueMetadata, unknown>> {
        return typeof given === 'object' && given !== null
    }

    const somethingLike = isSomethingLike(override)

    if (!somethingLike) {
        return false
    }

    const isChannelTextChannel = override.channel instanceof TextChannel

    return somethingLike && isChannelTextChannel
}

export class BoombotClient extends SapphireClient {
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

    private setupJukebox() {
        container.jukebox = new Player(this)

        container.jukebox.on('trackStart', async (queue, track) => {
            if (overrideIsSomething(queue.metadata) && queue.metadata.channel) {
                queue.metadata.channel.send({
                    embeds: [getPlayingNowEmbed(track)],
                })
            }
        })

        container.jukebox.on('trackEnd', async (queue) => {
            if (
                queue.tracks.length === 0 &&
                overrideIsSomething(queue.metadata) &&
                queue.metadata.channel
            ) {
                queue.metadata.channel.send(
                    `No more songs in queue. ${generateRandomEmoji('sad')}`
                )
            }
        })

        container.jukebox.on('botDisconnect', (queue) => {
            this.logger.info(`${queue.guild.name}:  Disconnected.`)
        })

        container.jukebox.on('error', (queue, error) => {
            this.logger.error(
                `${queue.guild.name}: Player Error.\n${error.name}: ${error.message}`
            )

            if (overrideIsSomething(queue.metadata) && queue.metadata.channel) {
                queue.metadata.channel.send(
                    `Something went wrong while playing \`${
                        queue.current.title
                    }\`, sorry. ${generateRandomEmoji('sad')}`
                )
            }
        })

        container.jukebox.on('connectionError', (queue, error) => {
            this.logger.error(
                `${queue.guild.name}: Player Connection Error.\n${error.name}: ${error.message}`
            )
        })
    }

    public override async login(token?: string) {
        this.setupJukebox()

        return super.login(token)
    }
}
