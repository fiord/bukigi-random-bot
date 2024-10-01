import {
    BUKIGI_MANAGER_COMMAND,
    BUKIGI_RANDOM_COMMAND,
    PING_COMMAND,
} from "./commands";
import dotenv from 'dotenv';
import process from 'node:process';

dotenv.config({ path: '.dev.vars' });

const token: string | undefined = process.env.DISCORD_TOKEN;
const applicationId: string | undefined = process.env.DISCORD_APPLICATION_ID;

if (!token) {
    throw new Error(`DISCORD_TOKEN must be set`);
} else if (!applicationId) {
    throw new Error(`DISCORD_APPLICATION_ID must be set`);
}

const url: string = `https://discord.com/api/v10/applications/${applicationId}/commands`;
const response: Response = await fetch(url, {
    headers: {
        'Content-Type': 'application/json',
        Authorization: `Bot ${token}`,
    },
    method: 'PUT',
    body: JSON.stringify([
        BUKIGI_MANAGER_COMMAND,
        BUKIGI_RANDOM_COMMAND,
        PING_COMMAND,
    ]),
});

if (response.ok) {
    console.log(`All commands registered successfully`);
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
} else {
    console.error(`Failed to register commands: ${response.status} - ${response.statusText}`);
    console.error(await response.text());
}