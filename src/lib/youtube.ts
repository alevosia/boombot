import * as yt from 'youtube-search-without-api-key'
import ytdl from 'ytdl-core-discord'

export async function searchVideoByTitle(title: string) {
    const results = await yt.search(title)

    return results[0]
}

export function download(url: string) {
    return ytdl(url, {
        filter: 'audioonly',
        highWaterMark: 1 << 25,
    })
}
