import { SlashCommandBuilder } from '@discordjs/builders'
import { ApplicationCommandRegistry, Command } from '@sapphire/framework'
import { CommandInteraction } from 'discord.js'
import { joinVoiceChannel } from '@discordjs/voice'
import { Queue } from '../structures/Queue'
import { Song } from '../structures/Song'
import { searchVideoByTitle } from '../lib/youtube'
import { getGuildIds } from '../lib/env'
import { generateRandomEmoji } from '../lib/emoji'

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
            .addStringOption((option) =>
                option
                    .setName('title')
                    .setDescription('The title of the song')
                    .setRequired(true)
            )

        registry.registerChatInputCommand(builder, { guildIds })
    }

    public async chatInputRun(interaction: CommandInteraction) {
        if (!interaction.guild || !interaction.member || !interaction.channel)
            return interaction.reply(
                `This command must be used in a server channel. ${generateRandomEmoji(
                    'funny'
                )}`
            )

        const guild = interaction.guild
        const member = guild.members.cache.get(interaction.member.user.id)
        const searchTitle = interaction.options.getString('title')

        if (!member || !member.voice.channel) {
            return interaction.reply(
                `You need to be in a voice channel to use this command. ${generateRandomEmoji(
                    'angry'
                )}`
            )
        }

        if (!searchTitle) {
            return interaction.reply(
                `You need to provide a title for the song. ${generateRandomEmoji(
                    'neutral'
                )}`
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
            queue = new Queue(guild.id, guild.name, interaction.channel)
            this.container.jukebox.queues.set(guild.id, queue)
        }

        let video

        try {
            video = await searchVideoByTitle(searchTitle)

            if (!video) {
                return interaction.editReply(
                    `I could not find any songs with that title. ${generateRandomEmoji(
                        'sad'
                    )}`
                )
            }
        } catch (error) {
            console.error(error)
            return interaction.editReply(
                `Failed to search for ${searchTitle}. ${generateRandomEmoji(
                    'sad'
                )}`
            )
        }

        const { id, title, url, backupUrl, duration_raw, snippet } = video

        const song: Song = {
            id: id.videoId,
            title,
            url,
            backupUrl,
            duration: duration_raw,
            thumbnailUrl: snippet.thumbnails.default.url,
            queuedBy: {
                name: member.displayName,
                iconUrl: member.user.displayAvatarURL(),
            },
        }

        queue.addSong(song, interaction)
    }
}
