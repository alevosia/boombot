import { Listener } from '@sapphire/framework'

export class ErrorListener extends Listener {
    public run(error: Error) {
        this.container.logger.error(
            'Encountered an error!',
            `${error.name}: ${error.message}`,
            error.stack
        )
    }
}
