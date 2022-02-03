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
import { download } from '../lib/youtube'
import { Song } from './Song'

export class Queue {
    public guildId: string
    public songs: Song[]
    public connection?: VoiceConnection | null
    public player: AudioPlayer
    public guildChannel: TextBasedChannel

    public constructor(guildId: string, guildChannel: TextBasedChannel) {
        this.guildId = guildId
        this.songs = []
        this.connection = null
        this.player = createAudioPlayer()
        this.guildChannel = guildChannel

        this.setupVoiceConnection()
        this.attachAudioPlayerListeners()

        console.log(`Created new queue for guild ${guildId}.`)
    }

    private attachAudioPlayerListeners() {
        this.player.on(AudioPlayerStatus.Idle, (oldState, newState) => {
            console.log(
                `Audio Player is ${newState.status}. Previous state was ${oldState.status}.`
            )

            if (this.songs.length > 0) {
                console.log(
                    'There is still a song left in queue. Shifting and playing next song.'
                )
                this.songs.shift()
                this.play()
            }
        })

        this.player.on(AudioPlayerStatus.Paused, () => {
            console.log(`Paused ${this.songs[0]?.title}`)
        })

        this.player.on(AudioPlayerStatus.AutoPaused, () => {
            console.log('There are no active voice connections to play to.')
        })
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
        container.jukebox.queues.delete(this.guildId)

        console.log(`Cleaned up queue for guild ${this.guildId}.`)
    }

    private setupVoiceConnection() {
        this.connection = getVoiceConnection(this.guildId)

        if (this.connection) {
            this.connection.subscribe(this.player)

            this.connection.on(VoiceConnectionStatus.Ready, () => {
                console.log(`Voice connection is ready.`)
            })

            this.connection.on(VoiceConnectionStatus.Disconnected, () => {
                console.log(`Voice connection is disconnected.`)
                this.cleanup()
            })

            this.connection.on(VoiceConnectionStatus.Destroyed, () => {
                console.log(`Voice connection is destroyed.`)
                this.cleanup()
            })
        }
    }

    private async play(interaction?: CommandInteraction) {
        // If there are no songs in the queue, stop playing
        if (this.songs.length === 0) {
            this.player.stop(true)
            this.send(`No more songs in the queue.`)
            return
        }

        // If there is no voice connection, create one
        if (!this.connection) {
            this.setupVoiceConnection()
        }

        const currentSong = this.songs[0]

        try {
            const stream = await download(
                currentSong.title,
                currentSong.url,
                currentSong.backupUrl
            )

            const resource = createAudioResource(stream)
            this.player.play(resource)

            const embed = getPlayingNowEmbed(currentSong)

            interaction
                ? interaction.editReply({ content: null, embeds: [embed] })
                : this.send(embed)
        } catch (error) {
            console.error(error)

            await this.send(`Failed to play \`${currentSong.title}\`.`)

            this.skip()
        }
    }

    public addSong(song: Song, interaction: CommandInteraction) {
        this.songs.push(song)

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
            return interaction?.reply('There are no songs in the queue.')
        }

        const embed = getSkippedEmbed(skippedSong)
        await (interaction
            ? interaction.reply({ embeds: [embed] })
            : this.send(embed))

        // Play the next song in the queue
        this.play()
    }

    public clear() {
        this.songs.splice(0, this.songs.length)
    }

    public send(message: string | MessageEmbed) {
        if (message instanceof MessageEmbed) {
            return this.guildChannel.send({ embeds: [message] })
        }

        return this.guildChannel.send(message)
    }
}
