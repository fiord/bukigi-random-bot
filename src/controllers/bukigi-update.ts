import { D1Database } from '@cloudflare/workers-types';
import { ActionRow, InteractionResponseType, MessageComponentTypes } from 'discord-interactions';
import { ErrorWithStatus } from '../utils/ErrorResponseType';
import { BUKIGI_MANAGER_COMMAND } from '../commands';
import { getBukigi, updateBukigi } from '../repository/d1';
import { Bukigi } from '../models/bukigi';

export class BukigiUpdateModalResponseType {
    type: number;
    data: {
        custom_id: string;
        title: string;
        components: ActionRow[];
    };
    error?: ErrorWithStatus;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const BukigiUpdateModal: (interaction: any, db: D1Database, options: any) => Promise<BukigiUpdateModalResponseType> = async (interaction, db, options) => {
    // should be in the guild(server)
    if (!interaction.guild_id) {
        console.log('guild_id is not specified');
        return {
            type: -1,
            data: {
                custom_id: '',
                title: '',
                components: [],
            },
            error: new ErrorWithStatus('対象のサーバの中で実行してね！', 100),
        };
    }

    const guild_id: number = interaction.guild_id;
    const user_id: number = interaction.member.user.id;

    let name = '';
    for (const option of options) {
        if (option.name === 'name') {
            name = option.value;
            break;
        }
    }

    const bukigi = await getBukigi(db, guild_id, user_id, name);
    if (bukigi === null) {
        return {
            type: -1,
            data: {
                custom_id: '',
                title: '',
                components: [],
            },
            error: new ErrorWithStatus('僕そのブキ擬まだ知らない...名前間違えてないかな？', 104),
        }
    }

    return {
        type: InteractionResponseType.MODAL,
        data: {
            custom_id: `${BUKIGI_MANAGER_COMMAND.update_modal_id}-${bukigi.name}`,
            title: 'ブキ擬の更新をしてね',
            components: [
                {
                    // Text inputs must be inside of an action component
                    type: MessageComponentTypes.ACTION_ROW,
                    components: [
                        {
                            // See https://discord.com/developers/docs/interactions/message-components#text-inputs-text-input-structure
                            type: MessageComponentTypes.INPUT_TEXT,
                            custom_id: 'name',
                            style: 1,
                            label: 'ブキ擬の名前',
                            placeholder: bukigi.name,
                            value: bukigi.name,
                            required: true,
                        },
                    ],
                },
                {
                    type: MessageComponentTypes.ACTION_ROW,
                    components: [
                        {
                            type: MessageComponentTypes.INPUT_TEXT,
                            custom_id: 'url',
                            style: 1,
                            label: 'メッセージリンク（名前と一緒に出すよ。画像は最初の1枚だけ表示されるよ）',
                            placeholder: bukigi.url,
                            value: bukigi.url,
                            required: true,
                        },
                    ],
                },
            ],
        },
    };
};

export class BukigiUpdateRespnseType {
    type: number;
    data: {
        content: string;
    };
    error?: ErrorWithStatus;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const BukigiUpdate: (interaction: any, db: D1Database, oldName: string) => Promise<BukigiUpdateRespnseType> = async (interaction, db, oldName) => {
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

    const oldBukigi = await getBukigi(db, guild_id, user_id, oldName);
    if (oldBukigi === null) {
        return {
            type: -1,
            data: {
                content: '',
            },
            error: new ErrorWithStatus('僕更新元のブキ擬まだ知らない...何か間違えてないかな？', 104),
        }
    }

    const newBukigi = new Bukigi(guild_id, user_id, '', '');
    for (const form of interaction.data.components) {
        switch (form.components[0].custom_id) {
            case 'name':
                newBukigi.name = form.components[0].value;
                break;
            case 'url':
                newBukigi.url = form.components[0].value;
                break;
            default:
                console.error(`Unknown custom_id: ${form.components[0].custom_id}`);
                return {
                    type: -1,
                    data: {
                        content: '',
                    },
                    error: new ErrorWithStatus('不正な custom_idが見つかりました', 101),
                };
        }
    }

    const res = await updateBukigi(db, oldBukigi, newBukigi);
    if (res > 0) {
        let message = 'ブキ擬の更新をしたよ！\n';
        message += `** 名前 **: ${oldBukigi.name} → ${newBukigi.name}\n`;
        message += `** リンク **: ${oldBukigi.url} → ${newBukigi.url}`;
        return {
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                content: message,
            },
        };
    } else {
        return {
            type: -1,
            data: {
                content: '',
            },
            error: new ErrorWithStatus('ブキ擬の更新に失敗しちゃった...', 105)
        };
    }
};