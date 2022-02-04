import { InteractionReplyOptions } from 'discord.js'
import { generateRandomEmoji } from './emoji'

type ResponseKey =
    | 'BOT_NOT_IN_VOICE_CHANNEL'
    | 'FAILED_JOIN'
    | 'MISSING_TITLE'
    | 'NO_MUSIC'
    | 'NOT_IN_VOICE_CHANNEL'
    | 'NOT_SAME_VOICE_CHANNEL'
    | 'SERVER_ONLY'

export const RESPONSES: Record<ResponseKey, string | InteractionReplyOptions> =
    {
        BOT_NOT_IN_VOICE_CHANNEL: {
            content: `I'm not even there. ${generateRandomEmoji(
                'disappointed'
            )}`,
            // ephemeral: true,
        },
        FAILED_JOIN: {
            content: `I couldn't join your voice channel. ${generateRandomEmoji(
                'sad'
            )}`,
            // ephemeral: true,
        },
        MISSING_TITLE: {
            content: `Give me a name! ${generateRandomEmoji('disappointed')}`,
            // ephemeral: true,
        },
        NO_MUSIC: {
            content: `I'm not playing anything. ${generateRandomEmoji(
                'disappointed'
            )}`,
            // ephemeral: true,
        },

        NOT_IN_VOICE_CHANNEL: {
            content: `Get in a voice channel and I might consider. ${generateRandomEmoji(
                'disappointed'
            )}`,
            // ephemeral: true,
        },
        NOT_SAME_VOICE_CHANNEL: {
            content: `You're not even here. ${generateRandomEmoji(
                'disappointed'
            )}`,
            // ephemeral: true,
        },
        SERVER_ONLY: {
            content: `Surely you're not asking me to do that here, silly?. ${generateRandomEmoji(
                'funny'
            )}`,
            // ephemeral: true,
        },
    }
