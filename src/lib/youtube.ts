import * as yt from 'youtube-search-without-api-key'
import ytdlCore from 'ytdl-core'
import ytdlDiscord from 'ytdl-core-discord'
import { Song } from '../structures/Song'

export async function searchVideoByTitle(title: string) {
    const results = await yt.search(title)

    return { ...results[0], backupUrl: results[1]?.url }
}

const ytdlOptions: ytdlCore.downloadOptions = {
    filter: 'audioonly',
    highWaterMark: 1 << 21,
}

export async function download({ title, url, backupUrl }: Song) {
    try {
        return await ytdlDiscord(url, ytdlOptions)
    } catch (error) {
        console.error(
            `Failed to play ${title}'s URL: ${url}. Trying backup: ${backupUrl}.`
        )

        return await ytdlDiscord(backupUrl, ytdlOptions)
    }
}
