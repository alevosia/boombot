import { SlashCommandBuilder } from '@discordjs/builders'
import { ApplicationCommandRegistry, Command } from '@sapphire/framework'
import type { CommandInteraction } from 'discord.js'
import { getGuildIds } from '../lib/env'

export class FlipCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            name: 'flip',
            aliases: ['coin'],
            description: 'Flips a coin!',
        })
    }

    public override registerApplicationCommands(
        registry: ApplicationCommandRegistry
    ) {
        const builder = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)

        registry.registerChatInputCommand(builder, {
            guildIds: getGuildIds(),
            idHints: ['938330364005482506'],
        })
    }

    public chatInputRun(interaction: CommandInteraction) {
        const face = Math.random() > 0.5 ? 'Heads!' : 'Tails!'

        return interaction.reply(face)
    }
}
