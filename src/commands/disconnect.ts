import { SlashCommandBuilder } from '@discordjs/builders'
import { ApplicationCommandRegistry, Command } from '@sapphire/framework'
import { CommandInteraction, GuildMember } from 'discord.js'
import { getGuildIds } from '../lib/env'
import { getDisconnectedEmbed } from '../lib/embeds'
import { RESPONSES } from '../lib/responses'

export class DisconnectCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            name: 'disconnect',
            description: 'Disconnects the bot from the voice channel',
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

        queue.destroy(true)

        return interaction.reply({ embeds: [getDisconnectedEmbed()] })
    }
}
