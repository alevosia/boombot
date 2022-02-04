import { Listener } from '@sapphire/framework'

export class ErrorListener extends Listener {
    public constructor(context: Listener.Context, options: Listener.Options) {
        super(context, {
            ...options,
            once: true,
            event: 'error',
        })
    }

    public run(error: Error) {
        this.container.logger.error(
            'Encountered an error!',
            error.name,
            error.message
        )
    }
}
