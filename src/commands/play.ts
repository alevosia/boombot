import { SlashCommandBuilder } from '@discordjs/builders'
import { ApplicationCommandRegistry, Command } from '@sapphire/framework'
import { CommandInteraction } from 'discord.js'
import { joinVoiceChannel } from '@discordjs/voice'
import { Queue } from '../structures/Queue'
import { Song } from '../structures/Song'
import { searchVideoByTitle } from '../lib/youtube'
import { getGuildIds } from '../lib/env'

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
            guildIds: getGuildIds(),
        })
    }

    public async chatInputRun(interaction: CommandInteraction) {
        if (!interaction.guild || !interaction.member || !interaction.channel)
            return interaction.reply(
                'This command must be used in a server channel.'
            )

        const guild = interaction.guild
        const member = guild.members.cache.get(interaction.member.user.id)
        const searchTitle = interaction.options.getString('title')

        if (!member || !member.voice.channel) {
            return interaction.reply(
                'You need to be in a voice channel to use this command.'
            )
        }

        if (!searchTitle) {
            return interaction.reply(
                'You need to provide a title for the song.'
            )
        }

        await interaction.reply(`Searching for \`${searchTitle}\`...`)

        joinVoiceChannel({
            channelId: member.voice.channel.id,
            guildId: guild.id,
            adapterCreator: member.voice.channel.guild.voiceAdapterCreator,
        })

        let queue = this.container.jukebox.queues.get(guild.id)

        if (!queue) {
            queue = new Queue(guild.id, interaction.channel)
            this.container.jukebox.queues.set(guild.id, queue)
        }

        let video

        try {
            video = await searchVideoByTitle(searchTitle)

            if (!video) {
                return interaction.editReply(
                    'I could not find any songs with that title.'
                )
            }
        } catch (error) {
            console.error(error)
            return interaction.editReply(`Failed to search for ${searchTitle}.`)
        }

        const { id, title, url } = video

        const song = new Song(id.videoId, title, url, member.user.username)

        queue.addSong(song, interaction)
    }
}
