import { Listener } from '@sapphire/framework'

export class ErrorListener extends Listener {
    public run(error: Error) {
        this.container.logger.error(
            `Client Error: ${error.name}: ${error.message}\n${error.stack}`
        )
    }
}
