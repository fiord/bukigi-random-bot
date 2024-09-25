import { IRequest, RequestHandler } from "itty-router";
import {
    InteractionResponseType,
    InteractionType,
    verifyKey,
} from "discord-interactions";
import { PING_COMMAND, RANDOM_REGISTER_COMMAND, RANDOM_SHOW_COMMAND } from "../commands";
import {
    BukigiRandomRegisterModal,
    BukigiRandomRegister,
} from "../controllers/bukigi-register";
import { ErrorWithStatus } from "../utils/ErrorResponseType";
import { D1Database } from "@cloudflare/workers-types";
import { BukigiRandomShow } from "./bukigi-show";

class JsonResponse extends Response {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(body?: any, init?: ResponseInit) {
        const jsonBody = JSON.stringify(body);
        init = init || {
            headers: {
                'content-type': 'application/json;charset=utf-8',
            },
        };
        super(jsonBody, init);
    }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const verifyDiscordRequest = async (req: IRequest, env: any) => {
    const signature: string | null = req.headers.get('X-Signature-Ed25519');
    const timestamp: string | null = req.headers.get('X-Signature-Timestamp');
    const body: string = await req.text();

    const isValidRequest = signature && timestamp && (await verifyKey(body, signature, timestamp, env.DISCORD_PUBLIC_KEY));

    if (!isValidRequest) {
        return {
            isValid: false,
            interaction: null,
        };
    }
    return {
        isValid: true,
        interaction: JSON.parse(body),
    };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mainRouter: RequestHandler<IRequest, [env: any]> = async (req, env) => {
    const { isValid, interaction } = await verifyDiscordRequest(req, env);
    if (!isValid || !interaction) {
        return new Response(`Bad request signature`, { status: 401 });
    }

    const db: D1Database = env.DB;

    try {
        switch (interaction.type) {
            case InteractionType.PING:
                // PING message is used during the initial webhook handshake.
                return new JsonResponse({
                    type: InteractionResponseType.PONG,
                });
                break;

            // slash commands
            case InteractionType.APPLICATION_COMMAND:
                switch (interaction.data.name.toLowerCase()) {
                    // ping
                    case PING_COMMAND.name.toLowerCase():
                        return new JsonResponse({
                            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                            data: {
                                content: 'ラクトだよ～',
                            }
                        });
                        break;

                    // bukigi-random-register
                    case RANDOM_REGISTER_COMMAND.name.toLowerCase(): {
                        const response = BukigiRandomRegisterModal();
                        return new JsonResponse(response);
                    }

                    // bukigi-random-show
                    case RANDOM_SHOW_COMMAND.name.toLowerCase(): {
                        const response = await BukigiRandomShow(interaction, db);
                        if (response.error) {
                            throw response.error;
                        }
                        return new JsonResponse(response);
                    }

                    default:
                        console.error(`Unsupported commands: ${interaction.data.name.toLowerCase()}`);
                        throw new ErrorWithStatus("僕そのコマンド知らない...", -2);
                }

            // modal submission
            case InteractionType.MODAL_SUBMIT: {
                const modalId: string = interaction.data.custom_id;
                if (modalId === RANDOM_REGISTER_COMMAND.modal_id) {
                    const response = await BukigiRandomRegister(interaction, db);
                    if (response.error) {
                        throw response.error;
                    }
                    return new JsonResponse(response);
                } else {
                    console.log(`unsupported modal: ${modalId}`);
                    throw new ErrorWithStatus(`僕そのコマンド知らない...`, -3);
                }
            }

            default:
                console.error(`Unknown interaction type: ${interaction.type}`);
                throw new ErrorWithStatus("僕そのコマンド知らない...", -1);
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
        if (err instanceof ErrorWithStatus) {
            // if there is not status field, return default as 200(HTTP OK).
            return new JsonResponse({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: err.getMessage(),
                }
            });
        }
        else {
            console.log(err);
            return new JsonResponse({
                error: "Internal Server Error",
            }, { status: 500 });
        }
    }
};