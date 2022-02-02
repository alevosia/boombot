import {
    VoiceConnection,
    AudioPlayer,
    createAudioResource,
    createAudioPlayer,
    AudioPlayerStatus,
    VoiceConnectionStatus,
    getVoiceConnection,
} from '@discordjs/voice'
import { TextBasedChannel } from 'discord.js'
import ytdl from 'ytdl-core-discord'
import { Song } from './Song'

export class Queue {
    public guildId: string
    public songs: Song[]
    public connection: VoiceConnection | null
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

    public setupVoiceConnection() {
        this.connection = getVoiceConnection(this.guildId) || null

        if (this.connection) {
            this.connection.subscribe(this.player)

            this.connection.on(VoiceConnectionStatus.Ready, () => {
                console.log(
                    `Ready: Voice Connection is ${this.connection?.state.status}`
                )
            })

            this.connection.on(VoiceConnectionStatus.Disconnected, () => {
                this.clear()
                console.log(
                    `Disconnected: Voice Connection is ${this.connection?.state.status}. Queue has been cleared.`
                )
                this.player.stop(true)
                this.connection = null
            })

            this.connection.on(VoiceConnectionStatus.Destroyed, () => {
                this.clear()
                console.log(
                    `Destroyed: Voice Connection is ${this.connection?.state.status}. Queue has been cleared.`
                )
                this.player.stop(true)
                this.connection = null
            })
        }
    }

    private async play() {
        if (this.songs.length === 0) {
            this.player.stop(true)
            return this.guildChannel.send(`No more songs in the queue.`)
        }

        if (!this.connection) {
            this.setupVoiceConnection()
        }

        const currentSong = this.songs[0]

        try {
            const stream = await ytdl(currentSong.id, {
                filter: 'audioonly',
            })

            const resource = createAudioResource(stream)
            this.player.play(resource)

            const response = `Now playing \`${currentSong.title}\`.`
            console.log(response)
            return this.guildChannel.send(response)
        } catch (error) {
            console.error(error)

            return this.guildChannel.send(
                `Failed to play \`${this.songs[0].title}\`.`
            )
        }
    }

    public addSong(song: Song): string | void {
        this.songs.push(song)

        if (this.songs.length === 1) {
            this.play()
        } else {
            const response = `Added \`${song.title}\` to the queue.`
            console.log(response)
            return response
        }
    }

    public skip(): string {
        const skippedSong = this.songs.shift()

        if (!skippedSong) {
            return 'There are no songs in the queue.'
        }

        this.play()
        return `Skipped \`${skippedSong.title}\`.`
    }

    public clear() {
        this.songs.splice(0, this.songs.length)
    }
}
