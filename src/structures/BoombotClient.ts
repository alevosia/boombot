import { SapphireClient, container } from '@sapphire/framework'
import { Player } from 'discord-player'
import { Message, TextChannel } from 'discord.js'
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
    nowPlaying?: Message
    noMoreSongs: Message
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

    const isNowPlayingMessage = override.nowPlaying
        ? override.nowPlaying instanceof Message
        : true

    const noMoreSongs = override.noMoreSongs
        ? override.noMoreSongs instanceof Message
        : true

    return (
        somethingLike &&
        isChannelTextChannel &&
        isNowPlayingMessage &&
        noMoreSongs
    )
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

    public override async login(token?: string) {
        container.jukebox = new Player(this)

        container.jukebox.on('trackStart', async (queue, track) => {
            if (!overrideIsSomething(queue.metadata)) return

            if (queue.metadata.noMoreSongs) {
                queue.metadata.noMoreSongs.delete()
            }

            if (queue.metadata.channel) {
                const message = await queue.metadata.channel.send({
                    embeds: [getPlayingNowEmbed(track)],
                })

                queue.metadata.nowPlaying = message
            }
        })

        container.jukebox.on('trackEnd', async (queue) => {
            if (!overrideIsSomething(queue.metadata)) return

            if (queue.metadata.nowPlaying) {
                queue.metadata.nowPlaying.delete()
            }

            if (queue.tracks.length === 0 && queue.metadata.channel) {
                queue.metadata.noMoreSongs = await queue.metadata.channel.send(
                    `No more songs in queue. ${generateRandomEmoji('sad')}`
                )
            }
        })

        container.jukebox.on('botDisconnect', (queue) => {
            if (
                overrideIsSomething(queue.metadata) &&
                queue.metadata.nowPlaying
            ) {
                queue.metadata.nowPlaying.delete()
            }
        })

        container.jukebox.on('error', (queue, error) => {
            this.logger.error(`${queue.guild.name}: ${error}`)
        })

        return super.login(token)
    }
}
