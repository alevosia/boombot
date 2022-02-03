import { MessageEmbed } from 'discord.js'
import { Song } from '../structures/Song'

export function getAddedToQueueEmbed(song: Song, position: number) {
    return new MessageEmbed()
        .setColor('#32cd32') // lime
        .setTitle(song.title)
        .setURL(song.url)
        .setAuthor({
            name: 'Added to queue',
        })
        .setThumbnail(song.thumbnailUrl)
        .setDescription(`Duration: ${song.duration}`)
        .setFooter({ text: `Position: ${position}` })
}

export function getPlayingNowEmbed(song: Song) {
    return new MessageEmbed()
        .setColor('#5acbd6') // aqua
        .setTitle(song.title)
        .setURL(song.url)
        .setAuthor({
            name: 'Now playing',
            iconURL: song.queuedBy.iconUrl,
        })
        .setThumbnail(song.thumbnailUrl)
        .setDescription(`Duration: ${song.duration}`)
}

export function getSkippedEmbed(song: Song) {
    return new MessageEmbed()
        .setColor('#d24747') // crimson
        .setAuthor({
            name: 'Skipped',
        })
        .setDescription(song.title)
}

export function getDisconnectedEmbed() {
    return new MessageEmbed()
        .setColor('#121212') // black
        .setAuthor({
            name: 'Disconnected',
        })
}
