import { SlashCommandBuilder } from '@discordjs/builders'
import { ApplicationCommandRegistry, Command } from '@sapphire/framework'
import type { CommandInteraction } from 'discord.js'

export class SkipCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            name: 'skip',
            description: 'Skips the current song',
        })
    }

    public override registerApplicationCommands(
        registry: ApplicationCommandRegistry
    ) {
        const guildIds = process.env.GUILD_ID ? [process.env.GUILD_ID] : []

        const builder = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)

        registry.registerChatInputCommand(builder, {
            guildIds,
            idHints: ['938436872919711744'],
        })
    }

    public async chatInputRun(interaction: CommandInteraction) {
        if (!interaction.guild || !interaction.member) return

        const member = interaction.guild.members.cache.get(
            interaction.member.user.id
        )

        if (!member || !member.voice.channel) {
            return interaction.reply(
                'You need to be in a voice channel to use this command.'
            )
        }

        const queue = this.container.jukebox.queues.get(interaction.guild.id)

        if (!queue) {
            return interaction.reply(
                'There is no music playing in this server.'
            )
        }

        const response = await queue.skip()

        return interaction.reply(response)
    }
}
