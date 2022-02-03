import * as yt from 'youtube-search-without-api-key'
import ytdl from 'ytdl-core-discord'

export async function searchVideoByTitle(title: string) {
    const results = await yt.search(title)

    return { ...results[0], backupUrl: results[1]?.url }
}

export async function download(title: string, url: string, backupUrl: string) {
    try {
        const stream = await ytdl(url, {
            filter: 'audioonly',
            highWaterMark: 1 << 25,
        })

        return stream
    } catch (error) {
        console.error(
            `Failed to play ${title}'s URL: ${url}. Trying backup: ${backupUrl}.`
        )

        const stream = await ytdl(backupUrl, {
            filter: 'audioonly',
            highWaterMark: 1 << 25,
        })

        return stream
    }
}
