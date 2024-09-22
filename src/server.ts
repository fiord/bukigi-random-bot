import { AutoRouter, IRequest } from "itty-router";
import {
    InteractionResponseType,
    InteractionType,
    verifyKey,
} from "discord-interactions";
import { PING_COMMAND, RANDOM_COMMAND } from "./commands";
import {
    BukigiRandomRegisterModal,
    BukigiRandomRegisterResponseType,
    BukigiRandomRegister,
} from "./controllers/bukigi-register";
import { ErrorWithStatus } from "./utils/ErrorResponseType";

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
}

const router = AutoRouter();

// wave
router.get('/', (_, env) => {
    return new Response(`Hello, this is ${env.DISCORD_APPLICATION_ID}`);
});

router.post('/', async (req, env) => {
    const { isValid, interaction } = await server.verifyDiscordRequest(req, env);
    if (!isValid || !interaction) {
        return new Response(`Bad request signature`, { status: 401 });
    }

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
                    case RANDOM_COMMAND.name.toLowerCase(): {
                        return new JsonResponse(BukigiRandomRegisterModal());
                    }

                    default:
                        console.error(`Unsupported commands: ${interaction.data.name.toLowerCase()}`);
                        throw new ErrorWithStatus("Unsupported command", 400);
                }

            // modal submission
            case InteractionType.MODAL_SUBMIT: {
                const modalId: string = interaction.data.custom_id;
                if (modalId === RANDOM_COMMAND.modal_id) {
                    const response = await BukigiRandomRegister(interaction);
                    if (response instanceof BukigiRandomRegisterResponseType) {
                        return new JsonResponse(await BukigiRandomRegister)
                    }
                    return new JsonResponse(await BukigiRandomRegister(interaction));
                } else {
                    throw new ErrorWithStatus(`Unsupported modal id: ${modalId}`, 400);
                }
            }
            default:
                console.error(`Unknown interaction type: ${interaction.type}`);
                throw new ErrorWithStatus("Unknown type", 400);
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
        if (err instanceof ErrorWithStatus) {
            // if there is not status field, return default as 200(HTTP OK).
            return new JsonResponse({
                error: err.message,
            }, { status: err.status || 200 });
        }
        else {
            console.log(err);
            return new JsonResponse({
                error: "Internal Server Error",
            }, { status: 500 });
        }
    }
});

router.all("*", () => new Response(`Not Found`, { status: 404 }));


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

const server = {
    verifyDiscordRequest,
    fetch: router.fetch,
};

export default server;