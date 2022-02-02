import { SlashCommandBuilder } from '@discordjs/builders'
import { ApplicationCommandRegistry, Command } from '@sapphire/framework'
import { CommandInteraction } from 'discord.js'
import {
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
} from '@discordjs/voice'
import ytdl from 'ytdl-core-discord'

export class PlayCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            name: 'play',
            description: 'Plays music',
        })
    }

    public override registerApplicationCommands(
        registry: ApplicationCommandRegistry
    ) {
        const guildIds = process.env.GUILD_ID ? [process.env.GUILD_ID] : []

        const builder = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption((option) =>
                option
                    .setName('title')
                    .setDescription('The title of the song')
                    .setRequired(true)
            )

        registry.registerChatInputCommand(builder, {
            guildIds,
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

        const title = interaction.options.getString('title')

        if (!title) {
            return interaction.reply(
                'You need to provide a title for the song.'
            )
        }

        const connection = joinVoiceChannel({
            channelId: member.voice.channel.id,
            guildId: interaction.guild.id,
            adapterCreator: member.voice.channel.guild.voiceAdapterCreator,
            selfDeaf: false,
        })

        console.log({
            connection: {
                guild: interaction.guild.name,
                channel: member.voice.channel.name,
                status: connection.state.status,
            },
        })

        const player = createAudioPlayer()

        try {
            const stream = await ytdl(title, {
                filter: 'audioonly',
            })

            const resource = createAudioResource(stream)

            connection.subscribe(player)

            player.play(resource)

            return interaction.reply(`Playing ${title}`)
        } catch (error) {
            console.error(error)
            return interaction.reply(`Could not play ${title}`)
        }
    }
}
