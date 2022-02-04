import { SlashCommandBuilder } from '@discordjs/builders'
import { ApplicationCommandRegistry, Command } from '@sapphire/framework'
import { CommandInteraction, GuildMember } from 'discord.js'
import { getSkippedEmbed } from '../lib/embeds'
import { getGuildIds } from '../lib/env'
import { RESPONSES } from '../lib/responses'

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
        let guildIds

        if (process.env.NODE_ENV !== 'production') {
            guildIds = getGuildIds()

            if (!guildIds || guildIds.length === 0) {
                throw new Error('Environment variable GUILD_IDS is missing.')
            }
        }

        const builder = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)

        registry.registerChatInputCommand(builder, { guildIds })
    }

    public chatInputRun(interaction: CommandInteraction) {
        if (
            !interaction.guild ||
            !(interaction.member instanceof GuildMember)
        ) {
            return interaction.reply(RESPONSES.SERVER_ONLY)
        }

        if (!interaction.member.voice.channelId) {
            return interaction.reply(RESPONSES.NOT_IN_VOICE_CHANNEL)
        }

        if (
            interaction.guild.me?.voice.channelId &&
            interaction.member.voice.channelId !==
                interaction.guild.me?.voice.channelId
        ) {
            return interaction.reply(RESPONSES.NOT_SAME_VOICE_CHANNEL)
        }

        const queue = this.container.jukebox.getQueue(interaction.guild)

        if (!queue) {
            return interaction.reply(RESPONSES.NO_MUSIC)
        }

        const currentTrack = queue.current
        queue.skip()
        return interaction.reply({ embeds: [getSkippedEmbed(currentTrack)] })
    }
}
