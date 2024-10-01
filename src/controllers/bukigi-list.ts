import { D1Database } from '@cloudflare/workers-types';
import { ErrorWithStatus } from '../utils/ErrorResponseType';
import { listUserBukigi } from '../repository/d1';
import { InteractionResponseType } from 'discord-interactions';

export class BukigiListResponseType {
    type: number;
    data: {
        content: string;
    }
    error?: ErrorWithStatus;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const BukigiList: (interaction: any, db: D1Database, token: string) => Promise<BukigiListResponseType> = async (interaction, db) => {
    // should be in the guild(server)
    if (!interaction.guild_id) {
        console.log('guild_id is not specified');
        return {
            type: -1,
            data: {
                content: '',
            },
            error: new ErrorWithStatus('対象のサーバの中で実行してね！', 100),
        };
    }

    const guild_id = interaction.guild_id;
    const user_id = interaction.member.user.id;

    const bukigis = await listUserBukigi(db, guild_id, user_id);

    let response = '登録されている君のブキ擬の一覧だよ！';
    for (const bukigi of bukigis) {
        response += `\n${bukigi.name}: ${bukigi.url}`
    }

    return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
            content: response,
        }
    };
};