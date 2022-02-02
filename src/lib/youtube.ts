import * as dotenv from 'dotenv'
import * as yt from 'youtube-search-without-api-key'

if (process.env.NODE_ENV !== 'production') {
    dotenv.config()
}

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY

if (!YOUTUBE_API_KEY) {
    throw new Error('Environment variable YOUTUBE_API_KEY is missing.')
}

export async function searchVideoByTitle(title: string) {
    const results = await yt.search(title)

    return results[0]
}
