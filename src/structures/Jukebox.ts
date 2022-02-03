import { Queue } from './Queue'

export class Jukebox {
    // Map of guildId and queue
    public queues: Map<string, Queue>

    public constructor() {
        this.queues = new Map()
    }
}
