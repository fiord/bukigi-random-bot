import { IRequest, RequestHandler } from "itty-router";
import {
    InteractionResponseType,
    InteractionType,
    verifyKey,
} from "discord-interactions";
import {
    BUKIGI_MANAGER_COMMAND,
    BUKIGI_RANDOM_COMMAND,
    PING_COMMAND,
} from "../commands";
import {
    BukigiRegisterModal,
    BukigiRegister,
} from "../controllers/bukigi-register";
import { ErrorWithStatus } from "../utils/ErrorResponseType";
import { D1Database } from "@cloudflare/workers-types";
import { BukigiList } from "./bukigi-list";
import { BukigiRandom } from "./bukigi-random";
import { BukigiUpdate, BukigiUpdateModal } from "./bukigi-update";
import { BukigiDelete } from "./bukigi-delete";

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
                console.log(interaction.data);
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

                    // bukigi-manager
                    case BUKIGI_MANAGER_COMMAND.name.toLowerCase(): {
                        const subCommand = interaction.data.options[0];
                        switch (subCommand.name.toLowerCase()) {
                            case 'list': {
                                const response = await BukigiList(interaction, db, env.DISCORD_TOKEN);
                                if (response.error) {
                                    throw response.error;
                                }
                                return new JsonResponse(response);
                            }
                            case 'register': {
                                const response = BukigiRegisterModal();
                                return new JsonResponse(response);
                            }
                            case 'update': {
                                const response = await BukigiUpdateModal(interaction, db, interaction.data.options[0].options);
                                if (response.error) {
                                    throw response.error;
                                }
                                return new JsonResponse(response);
                            }
                            case 'delete': {
                                const response = await BukigiDelete(interaction, db, interaction.data.options[0].options);
                                if (response.error) {
                                    throw response.error;
                                }
                                return new JsonResponse(response);
                            }

                            default:
                                console.error(`Unsupported subcommand ${subCommand}`);
                                throw new ErrorWithStatus("僕そのコマンド知らない...", -4);
                        }
                    }

                    // bukigi-random
                    case BUKIGI_RANDOM_COMMAND.name.toLowerCase(): {
                        const response = await BukigiRandom(interaction, db, env.DISCORD_TOKEN);
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
                console.log(JSON.stringify(interaction.data));
                const modalId: string = interaction.data.custom_id;
                // register
                if (modalId === BUKIGI_MANAGER_COMMAND.register_modal_id) {
                    const response = await BukigiRegister(interaction, db);
                    if (response.error) {
                        throw response.error;
                    }
                    return new JsonResponse(response);
                }
                // update
                else if (modalId.startsWith(BUKIGI_MANAGER_COMMAND.update_modal_id)) {
                    // bukigi-manager-update-modal-${bukigi.name}
                    const oldName = modalId.substring(BUKIGI_MANAGER_COMMAND.update_modal_id.length + 1);
                    const response = await BukigiUpdate(interaction, db, oldName);
                    if (response.error) {
                        throw response.error;
                    }
                    return new JsonResponse(response);
                }

                else {
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