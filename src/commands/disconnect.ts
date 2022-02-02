import { SlashCommandBuilder } from '@discordjs/builders'
import { ApplicationCommandRegistry, Command } from '@sapphire/framework'
import type { CommandInteraction } from 'discord.js'
import { getVoiceConnection } from '@discordjs/voice'

export class DisconnectCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            name: 'disconnect',
            aliases: ['dc'],
            description: 'Disconnects the bot from the voice channel',
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
        })
    }

    public chatInputRun(interaction: CommandInteraction) {
        if (!interaction.guild || !interaction.member) return

        const member = interaction.guild.members.cache.get(
            interaction.member.user.id
        )

        if (!member || !member.voice.channel) {
            return interaction.reply(
                'You need to be in a voice channel to use this command.'
            )
        }

        const connection = getVoiceConnection(interaction.guild.id)

        if (!connection) {
            return interaction.reply(
                'I am not connected to a voice channel in this guild.'
            )
        }

        connection.destroy()

        console.log({
            connection: {
                guildId: interaction.guild.id,
                status: connection.state.status,
            },
        })

        return interaction.reply(`Disconnected`)
    }
}
