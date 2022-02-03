interface Author {
    name: string
    iconUrl: string
}

export interface Song {
    id: string
    title: string
    url: string
    backupUrl: string
    duration: string
    thumbnailUrl: string
    queuedBy: Author
}
