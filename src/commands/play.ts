import { SlashCommandBuilder } from '@discordjs/builders'
import { ApplicationCommandRegistry, Command } from '@sapphire/framework'
import { CommandInteraction, GuildMember } from 'discord.js'
import { getAddedToQueueEmbed } from '../lib/embeds'
import { generateRandomEmoji } from '../lib/emoji'
import { getGuildIds } from '../lib/env'
import { RESPONSES } from '../lib/responses'

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
        await interaction.deferReply()

        if (
            !interaction.guild ||
            !(interaction.member instanceof GuildMember)
        ) {
            return interaction.followUp(RESPONSES.SERVER_ONLY)
        }

        if (!interaction.member.voice.channelId) {
            return interaction.followUp(RESPONSES.NOT_IN_VOICE_CHANNEL)
        }

        if (
            interaction.guild.me?.voice.channelId &&
            interaction.member.voice.channelId !==
                interaction.guild.me?.voice.channelId
        ) {
            return interaction.followUp(RESPONSES.NOT_SAME_VOICE_CHANNEL)
        }

        const searchTitle = interaction.options.getString('title')

        if (!searchTitle) {
            return interaction.followUp(RESPONSES.MISSING_TITLE)
        }

        const queue = this.container.jukebox.createQueue(interaction.guild, {
            disableVolume: true,
            ytdlOptions: {
                filter: 'audioonly',
                highWaterMark: 1 << 25,
                dlChunkSize: 0,
            },
            metadata: {
                channel: interaction.channel,
            },
        })

        try {
            if (!queue.connection && !queue.destroyed) {
                await queue.connect(interaction.member.voice.channelId)
            }
        } catch {
            if (!queue.destroyed) {
                queue.destroy()
            }
            return interaction.followUp(RESPONSES.FAILED_JOIN)
        }

        await interaction.followUp(`Searching for \`${searchTitle}\`...`)

        const result = await this.container.jukebox.search(searchTitle, {
            requestedBy: interaction.user,
        })

        const track = result.tracks[0]

        if (!track) {
            return interaction.followUp(
                `I couldn't find any tracks for \`${searchTitle}\`, sorry. ${generateRandomEmoji(
                    'sad'
                )}`
            )
        }

        try {
            await queue.play(track)

            if (queue.tracks.length === 0) {
                return interaction.deleteReply()
            } else {
                return interaction.editReply({
                    content: null,
                    embeds: [
                        getAddedToQueueEmbed(track, queue.tracks.length + 1),
                    ],
                })
            }
        } catch (error) {
            this.container.logger.error(error)
            return interaction.editReply(
                `Failed to play \`${
                    track.title
                }\`, sorry. ${generateRandomEmoji('sad')}`
            )
        }
    }
}
