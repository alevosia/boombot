import { SlashCommandBuilder } from '@discordjs/builders'
import { ApplicationCommandRegistry, Command } from '@sapphire/framework'
import type { CommandInteraction } from 'discord.js'
import { getGuildIds } from '../lib/env'

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
        const guildIds = getGuildIds()
        console.log({ Skip: guildIds })
        if (!guildIds || guildIds.length === 0) {
            throw new Error('Environment variable GUILD_IDS is missing.')
        }

        const builder = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)

        registry.registerChatInputCommand(builder, {
            guildIds,
            idHints: ['938436872919711744'],
        })
    }

    public async chatInputRun(interaction: CommandInteraction) {
        if (!interaction.guild || !interaction.member)
            return interaction.reply(
                'This command must be used in a server channel.'
            )

        const guild = interaction.guild
        const member = interaction.guild.members.cache.get(
            interaction.member.user.id
        )

        if (!member || !member.voice.channel) {
            return interaction.reply(
                'You need to be in a voice channel to use this command.'
            )
        }

        const queue = this.container.jukebox.queues.get(guild.id)

        if (!queue) {
            return interaction.reply(
                'There is no music playing in this server.'
            )
        }

        queue.skip(interaction)
    }
}
