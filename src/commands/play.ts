import { SlashCommandBuilder } from '@discordjs/builders'
import { ApplicationCommandRegistry, Command } from '@sapphire/framework'
import { CommandInteraction } from 'discord.js'
import { joinVoiceChannel } from '@discordjs/voice'
import { Queue } from '../structures/Queue'
import { Song } from '../structures/Song'
import { searchVideoByTitle } from '../lib/youtube'

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
        if (!interaction.guild || !interaction.member || !interaction.channel)
            return

        const member = interaction.guild.members.cache.get(
            interaction.member.user.id
        )

        if (!member || !member.voice.channel) {
            return interaction.reply(
                'You need to be in a voice channel to use this command.'
            )
        }

        const searchTitle = interaction.options.getString('title')

        if (!searchTitle) {
            return interaction.reply(
                'You need to provide a title for the song.'
            )
        }

        await interaction.reply(`Searching for \`${searchTitle}\`...`)

        joinVoiceChannel({
            channelId: member.voice.channel.id,
            guildId: interaction.guild.id,
            adapterCreator: member.voice.channel.guild.voiceAdapterCreator,
        })

        let queue = this.container.jukebox.queues.get(interaction.guild.id)

        if (!queue) {
            queue = new Queue(interaction.guild.id, interaction.channel)
            this.container.jukebox.queues.set(interaction.guild.id, queue)
        }

        try {
            const video = await searchVideoByTitle(searchTitle)

            if (!video) {
                return interaction.editReply(
                    'I could not find any songs with that title.'
                )
            }

            const response = await queue.addSong(
                new Song(
                    video.id.videoId,
                    video.title,
                    video.url,
                    interaction.member.user.username
                )
            )

            if (response) {
                return interaction.editReply(response)
            }
        } catch (error) {
            console.error(error)
            return interaction.editReply(`Failed to play ${searchTitle}.`)
        }
    }
}
