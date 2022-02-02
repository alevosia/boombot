export class Song {
    public constructor(
        public id: string,
        public title: string,
        public url: string,
        public queuedBy: string
    ) {}
}
