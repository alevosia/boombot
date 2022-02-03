import { SlashCommandBuilder } from '@discordjs/builders'
import { ApplicationCommandRegistry, Command } from '@sapphire/framework'
import type { CommandInteraction } from 'discord.js'
import { getVoiceConnection } from '@discordjs/voice'
import { getGuildIds } from '../lib/env'
import { getDisconnectedEmbed } from '../lib/embeds'
import { generateRandomEmoji } from '../lib/emoji'

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
        if (!interaction.guild || !interaction.member)
            return interaction.reply(
                `This command must be used in a server channel. ${generateRandomEmoji(
                    'funny'
                )}`
            )

        const member = interaction.guild.members.cache.get(
            interaction.member.user.id
        )

        if (!member || !member.voice.channel) {
            return interaction.reply(
                `You need to be in a voice channel to use this command. ${generateRandomEmoji(
                    'angry'
                )}`
            )
        }

        const connection = getVoiceConnection(interaction.guild.id)

        if (!connection) {
            return interaction.reply(
                `I am not connected to a voice channel in this server. ${generateRandomEmoji(
                    'neutral'
                )}`
            )
        }

        connection.destroy()

        return interaction.reply({ embeds: [getDisconnectedEmbed()] })
    }
}
