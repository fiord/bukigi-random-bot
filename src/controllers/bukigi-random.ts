import { D1Database } from "@cloudflare/workers-types";
import { sample } from "lodash";
import { ErrorWithStatus } from "../utils/ErrorResponseType";
import { listUserBukigi } from "../repository/d1";
import { RANDOM_REGISTER_COMMAND } from "../commands";
import { InteractionResponseType } from "discord-interactions";
import { Bukigi } from "../models/bukigi";
import { Embed, getUrlContent } from "../utils/urlValidator";

export class BukigiRandomResponseType {
    type: number;
    data: {
        content: string;
        embeds?: Embed[];
    }
    error?: ErrorWithStatus;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const BukigiRandom: (interaction: any, db: D1Database, token: string) => Promise<BukigiRandomResponseType> = async (interaction, db, token) => {
    // should be in the guild
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

    const guild_id = interaction.guild_id;
    const user_id = interaction.member.user.id;

    const bukigis = await listUserBukigi(db, guild_id, user_id);

    if (bukigis.length === 0) {
        console.log("No bukigi found for the user");
        return {
            type: -1,
            data: {
                content: "",
            },
            error: new ErrorWithStatus(`君のブキ擬、まだ僕知らないんだ... ${RANDOM_REGISTER_COMMAND.name} で教えてね！`, 103),
        };
    }

    // random.choice
    const bukigi: Bukigi = sample(bukigis);

    const embeds = await getUrlContent(bukigi.url, token, bukigi.name);

    return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
            content: `${bukigi.name} です！`,
            embeds: embeds,
        },
    };
};