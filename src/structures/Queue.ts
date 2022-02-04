import {
    VoiceConnection,
    AudioPlayer,
    createAudioResource,
    createAudioPlayer,
    AudioPlayerStatus,
    VoiceConnectionStatus,
    getVoiceConnection,
} from '@discordjs/voice'
import { container } from '@sapphire/framework'
import { CommandInteraction, MessageEmbed, TextBasedChannel } from 'discord.js'
import {
    getAddedToQueueEmbed,
    getPlayingNowEmbed,
    getSkippedEmbed,
} from '../lib/embeds'
import { generateRandomEmoji } from '../lib/emoji'
import { download } from '../lib/youtube'
import { Song } from './Song'

export class Queue {
    public guildId: string
    public guildName: string
    public songs: Song[]
    public connection?: VoiceConnection | null
    public player: AudioPlayer
    public guildChannel: TextBasedChannel

    public constructor(
        guildId: string,
        guildName: string,
        guildChannel: TextBasedChannel
    ) {
        this.guildId = guildId
        this.guildName = guildName
        this.songs = []
        this.connection = null
        this.player = createAudioPlayer()
        this.guildChannel = guildChannel

        this.setupVoiceConnection()
        this.attachAudioPlayerListeners()

        console.log(`${this.guildName}: Created a new queue.`)
    }

    private attachAudioPlayerListeners() {
        this.player.on(AudioPlayerStatus.Idle, () => {
            console.log(
                `${this.guildName}: Audio Player is idle. Playing next song.`
            )

            // Play the next song whenever the player is idle
            this.songs.shift()
            this.play()
        })

        this.player.on(AudioPlayerStatus.Buffering, () => {
            console.log(
                `${this.guildName}: Audio player is buffering "${this.songs[0]?.title}".`
            )
        })

        this.player.on(AudioPlayerStatus.Playing, () => {
            console.log(
                `${this.guildName}: Audio player is playing "${this.songs[0]?.title}".`
            )
        })

        this.player.on(AudioPlayerStatus.Paused, () => {
            console.log(
                `${this.guildName}: Audio player paused "${this.songs[0]?.title}".`
            )
        })

        this.player.on(AudioPlayerStatus.AutoPaused, () => {
            console.log(
                `${this.guildName}: Player is autopaused. No active voice connections.`
            )
        })

        this.player.on('error', (error) => {
            console.log(`${this.guildName}: Audio player error: ${error}`)
        })
    }

    private setupVoiceConnection() {
        console.log(`${this.guildName}: Setting up voice connection.`)
        this.connection = getVoiceConnection(this.guildId)

        if (this.connection) {
            this.connection.subscribe(this.player)

            this.connection.on(VoiceConnectionStatus.Signalling, () => {
                console.log(
                    `${this.guildName}: Voice connection is signalling.`
                )
            })

            this.connection.on(VoiceConnectionStatus.Connecting, () => {
                console.log(
                    `${this.guildName}: Voice connection is connecting.`
                )
            })

            this.connection.on(VoiceConnectionStatus.Ready, () => {
                console.log(`${this.guildName}: Voice connection is ready.`)
            })

            this.connection.on(VoiceConnectionStatus.Disconnected, () => {
                console.log(
                    `${this.guildName}: Voice connection is disconnected.`
                )
                this.cleanup()
            })

            this.connection.on(VoiceConnectionStatus.Destroyed, () => {
                console.log(`${this.guildName}: Voice connection is destroyed.`)
                this.cleanup()
            })
        }
    }

    private cleanup() {
        this.clear()
        this.player.stop(true)

        if (
            this.connection &&
            this.connection.state.status !== VoiceConnectionStatus.Destroyed
        ) {
            this.connection.destroy()
        }

        // Delete the guild's queue from the queues map
        const isDeleted = container.jukebox.queues.delete(this.guildId)

        console.log(
            `${this.guildName}: ${
                isDeleted ? 'Cleaned up' : 'Failed to clean up'
            } queue.`
        )
    }

    private async play(interaction?: CommandInteraction) {
        // If there are no songs in the queue, stop playing
        if (this.songs.length === 0) {
            console.log(`${this.guildName}: No more songs in the queue.`)
            return this.send(
                `No more songs in the queue. ${generateRandomEmoji('sad')}`
            )
        }

        // If there is no voice connection, create one
        if (!this.connection) {
            this.setupVoiceConnection()
        }

        const currentSong = this.songs[0]

        try {
            const stream = await download(currentSong)

            stream.on('pause', () => {
                console.log(
                    `${this.guildName}: Stream paused for ${currentSong.title}.`
                )
            })

            stream.on('resume', () => {
                console.log(
                    `${this.guildName}: Stream resumed for ${currentSong.title}.`
                )
            })

            stream.on('end', () => {
                console.log(
                    `${this.guildName}: Stream ended for ${currentSong.title}.`
                )
            })

            stream.on('close', () => {
                console.log(
                    `${this.guildName}: Stream closed for ${currentSong.title}.`
                )
            })

            stream.on('error', (error) => {
                console.error(
                    `${this.guildName}: Stream errored for ${currentSong.title}: ${error}`
                )
            })

            const resource = createAudioResource(stream)
            this.player.play(resource)

            console.log(
                `${this.guildName}: Now playing "${currentSong.title}".`
            )

            const embed = getPlayingNowEmbed(currentSong)
            return interaction
                ? interaction.editReply({ content: null, embeds: [embed] })
                : this.send(embed)
        } catch (error) {
            console.error(error)

            await this.send(
                `Failed to play \`${currentSong.title}\`. ${generateRandomEmoji(
                    'sad'
                )}`
            )

            return this.skip()
        }
    }

    public addSong(song: Song, interaction: CommandInteraction) {
        this.songs.push(song)

        console.log(`${this.guildName}: Added "${song.title}" to the queue.`)

        //  If there is only one song in the queue after adding, play it
        if (this.songs.length === 1) {
            this.play(interaction)
        } else {
            interaction.editReply({
                content: null,
                embeds: [getAddedToQueueEmbed(song, this.songs.length)],
            })
        }
    }

    public async skip(interaction?: CommandInteraction) {
        const skippedSong = this.songs.shift()

        // If there are no more songs in the queue, stop playing
        if (!skippedSong) {
            return interaction?.reply(
                `There are no songs in the queue. ${generateRandomEmoji(
                    'neutral'
                )}`
            )
        }

        console.log(`${this.guildName}: Skipped "${skippedSong.title}".`)

        const embed = getSkippedEmbed(skippedSong)
        await (interaction
            ? interaction.reply({ embeds: [embed] })
            : this.send(embed))

        // Play the next song in the queue
        this.play()
    }

    public clear() {
        this.songs.splice(0, this.songs.length)
        console.log(`${this.guildName}: Cleared the queue.`)
    }

    public send(message: string | MessageEmbed) {
        if (message instanceof MessageEmbed) {
            return this.guildChannel.send({ embeds: [message] })
        }

        return this.guildChannel.send(message)
    }
}
