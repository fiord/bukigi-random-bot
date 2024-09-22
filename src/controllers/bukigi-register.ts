import {
    InteractionResponseType,
    MessageComponentTypes,
    ActionRow,
} from "discord-interactions";

import { RANDOM_COMMAND } from "../commands";
import { ErrorWithStatus } from "../utils/ErrorResponseType";

export class BukigiRandomRegisterType {
    type: number;
    data: {
        custom_id: string;
        title: string;
        components: ActionRow[];
    };
};

export const BukigiRandomRegisterModal: () => (BukigiRandomRegisterType) = () => {
    return {
        type: InteractionResponseType.MODAL,
        data: {
            custom_id: RANDOM_COMMAND.modal_id,
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
                            label: 'メッセージリンク（名前と一緒に出すよ）',
                        },
                    ],
                },
            ],
        },
    };
};

export class BukigiRandomRegisterResponseType {
    type: number;
    data: {
        content: string;
    };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const BukigiRandomRegister: (interaction: any) => Promise<BukigiRandomRegisterResponseType> = async (interaction) => {
    // should be in the guild(server)
    if (!interaction.guild_id) {
        console.log("guild_id is not specified");
        throw new ErrorWithStatus("対象のサーバの中で実行してね！", 400);
    }

    console.log(interaction);
    const formValues = new Map<string, string>();
    let responseString: string = "以下の内容を登録したよ！";

    responseString += `\nguild_id: ${interaction.guild_id}`;
    responseString += `\nuser_id: ${interaction.member.user.id}`;

    // read form contents
    for (const form of interaction.data.components) {
        formValues.set(form.components[0].custom_id, form.components[0].value);
        responseString += `\n${form.components[0].custom_id}: ${form.components[0].value}`;
    }

    return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
            content: responseString,
        }
    };
}