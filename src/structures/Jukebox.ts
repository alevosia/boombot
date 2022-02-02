import { Queue } from './Queue'

export class Jukebox {
    public queues: Map<string, Queue>

    public constructor() {
        this.queues = new Map()
    }
}
