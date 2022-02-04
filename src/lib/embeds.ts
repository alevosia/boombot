import { Track } from 'discord-player'
import { MessageEmbed } from 'discord.js'

export function getAddedToQueueEmbed(track: Track, position: number) {
    return new MessageEmbed()
        .setColor('#32cd32') // lime
        .setTitle(track.title)
        .setURL(track.url)
        .setAuthor({
            name: 'Added to queue',
        })
        .setThumbnail(track.thumbnail)
        .setFooter({
            text: `Duration: ${track.duration} • Position: ${position}`,
        })
}

export function getPlayingNowEmbed(track: Track) {
    return new MessageEmbed()
        .setColor('#5acbd6') // aqua
        .setTitle(track.title)
        .setURL(track.url)
        .setAuthor({
            name: 'Now playing',
            iconURL: track.requestedBy.displayAvatarURL(),
        })
        .setThumbnail(track.thumbnail)
        .setFooter({ text: `Duration: ${track.duration}` })
}

export function getSkippedEmbed(track: Track) {
    return new MessageEmbed()
        .setColor('#d24747') // crimson
        .setAuthor({
            name: 'Skipped',
        })
        .setDescription(track.title)
}

export function getDisconnectedEmbed() {
    return new MessageEmbed()
        .setColor('#121212') // black
        .setAuthor({
            name: 'Disconnected',
        })
}
