import {
    InteractionResponseType,
    MessageComponentTypes,
    ActionRow,
} from "discord-interactions";

import { BUKIGI_MANAGER_COMMAND } from "../commands";
import { ErrorWithStatus } from "../utils/ErrorResponseType";
import { Bukigi } from "../models/bukigi";
import { registerBukigi } from "../repository/d1";
import { D1Database } from "@cloudflare/workers-types";

export class BukigiRegisterModalResponseType {
    type: number;
    data: {
        custom_id: string;
        title: string;
        components: ActionRow[];
    };
};

export const BukigiRegisterModal: () => (BukigiRegisterModalResponseType) = () => {
    return {
        type: InteractionResponseType.MODAL,
        data: {
            custom_id: BUKIGI_MANAGER_COMMAND.register_modal_id,
            title: 'ブキ擬を登録してね',
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
                        },
                    ],
                },
            ],
        },
    };
};

export class BukigiRegisterResponseType {
    type: number;
    data: {
        content: string;
    };
    error?: ErrorWithStatus;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const BukigiRegister: (interaction: any, db: D1Database) => Promise<BukigiRegisterResponseType> = async (interaction, db) => {
    // should be in the guild(server)
    if (!interaction.guild_id) {
        console.log("guild_id is not specified");
        return {
            type: -1,
            data: {
                content: "",
            },
            error: new ErrorWithStatus("対象のサーバの中で実行してね！", 100),
        };
    }

    let responseString: string = "以下の内容を登録したよ！";

    const newBukigi = Bukigi.emptyBukigi();
    newBukigi.guild_id = interaction.guild_id;
    newBukigi.user_id = interaction.member.user.id;

    // read form contents
    for (const form of interaction.data.components) {
        responseString += `\n${form.components[0].custom_id}: ${form.components[0].value}`;
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
                        content: "",
                    },
                    error: new ErrorWithStatus("不正な custom_idが見つかりました", 101),
                };
        }
    }

    // save to database
    const response = await registerBukigi(db, newBukigi);
    console.log(response);
    if (response > 0) {
        return {
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                content: responseString,
            }
        };
    } else {
        return {
            type: -1,
            data: {
                content: "",
            },
            error: new ErrorWithStatus("ブキ擬の登録に失敗しちゃった...名前被ってないか list コマンドで見てみて！", 102),
        }
    }
}