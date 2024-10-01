import { D1Database } from '@cloudflare/workers-types';
import { ErrorWithStatus } from '../utils/ErrorResponseType';
import { deleteBukigi, getBukigi } from '../repository/d1';
import { InteractionResponseType } from 'discord-interactions';

export class BukigiDeleteResponseType {
    type: number;
    data: {
        content: string;
    };
    error?: ErrorWithStatus;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const BukigiDelete: (interaction: any, db: D1Database, options: any) => Promise<BukigiDeleteResponseType> = async (interaction, db, options) => {
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

    const guild_id: number = interaction.guild_id;
    const user_id: number = interaction.member.user.id;

    let bukiName = '';
    for (const option of options) {
        if (option.name === 'name') {
            bukiName = option.value;
            break;
        }
    }

    const bukigi = await getBukigi(db, guild_id, user_id, bukiName);
    if (bukigi === null) {
        return {
            type: -1,
            data: {
                content: '',
            },
            error: new ErrorWithStatus('僕削除するブキ擬まだ知らない...何か間違えてないかな？', 104),
        }
    }

    const res = await deleteBukigi(db, bukigi);
    if (res) {
        return {
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                content: `バイバイ、${bukigi.name} ${bukigi.url}`,
            },
        };
    } else {
        return {
            type: -1,
            data: {
                content: '',
            },
            error: new ErrorWithStatus('ブキ擬の削除に失敗しちゃった...', 106),
        }
    }
}