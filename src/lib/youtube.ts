import * as yt from 'youtube-search-without-api-key'

export async function searchVideoByTitle(title: string) {
    const results = await yt.search(title)

    return results[0]
}
