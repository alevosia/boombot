import * as dotenv from 'dotenv'
import axios from 'axios'
import url from 'url'
import he from 'he'

interface YoutubeVideo {
    id: string
    title: string
}

const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/search'

if (process.env.NODE_ENV !== 'production') {
    dotenv.config()
}

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY

if (!YOUTUBE_API_KEY) {
    throw new Error('Environment variable YOUTUBE_API_KEY is missing.')
}

export async function searchVideoByTitle(
    title: string
): Promise<YoutubeVideo | null> {
    const searchParams = new url.URLSearchParams({
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        key: YOUTUBE_API_KEY!,
        part: 'snippet',
        q: title,
        type: 'video',
        maxResults: '3',
    })

    console.log(searchParams.toString())

    const results = await axios.get(YOUTUBE_API_URL, {
        params: searchParams,
    })

    const item = results.data.items[0]

    if (!item) {
        return null
    }

    console.log(item)

    if (item.id?.videoId && item.snippet?.title) {
        return {
            id: item.id.videoId,
            title: he.decode(item.snippet.title),
        }
    }

    return null
}
