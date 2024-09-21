import { AutoRouter, IRequest } from "itty-router";
import {
    InteractionResponseType,
    InteractionType,
    verifyKey,
} from "discord-interactions";
import { RANDOM_COMMAND } from "./commands";

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

    switch (interaction.type) {
        case InteractionType.PING:
            // PING message is used during the initial webhook handshake.
            return new JsonResponse({
                type: InteractionResponseType.PONG,
            });
            break;
        case InteractionType.APPLICATION_COMMAND:
            switch (interaction.data.name.toLowerCase()) {
                case RANDOM_COMMAND.name.toLowerCase(): {
                    const v: number = Math.floor(Math.random() * 10);
                    return new JsonResponse({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: {
                            content: v,
                        }
                    });
                }
                default:
                    console.error(`Unsupported commands: ${interaction.data.name.toLowerCase()}`);
            }
            break;
        default:
            console.error(`Unknown interaction type: ${interaction.type}`);
            return new JsonResponse({
                error: `Unknown type`,
            }, { status: 400 });
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