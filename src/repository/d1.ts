import { D1Database } from "@cloudflare/workers-types";
import { Bukigi } from "../models/bukigi";

export const registerBukigi: (db: D1Database, bukigi: Bukigi) => Promise<number> = async (db, bukigi) => {
    try {
        const result = await db
            .prepare(
                `INSERT INTO bukigis(guild_id, user_id, name, url) VALUES(?, ?, ?, ?)`,
            )
            .bind(bukigi.guild_id, bukigi.user_id, bukigi.name, bukigi.url)
            .run();
        return result.meta.rows_written;
    } catch (err) {
        console.log(err.message);
        return 0;
    }
};

export const listUserBukigi: (db: D1Database, guild_id: number, user_id: number) => Promise<Array<Bukigi>> = async (db, guild_id, user_id) => {
    try {
        const { results } = await db
            .prepare(
                `SELECT * FROM bukigis WHERE guild_id = ? AND user_id = ?`,
            )
            .bind(guild_id, user_id)
            .all();

        const response: Array<Bukigi> = results.map((row) => {
            let guild_id = 0;
            if (typeof row.guild_id === 'number') {
                guild_id = row.guild_id;
            }

            let user_id = 0;
            if (typeof row.user_id === 'number') {
                user_id = row.user_id;
            }

            let name = '';
            if (typeof row.name === 'string') {
                name = row.name;
            }

            let url = '';
            if (typeof row.url === 'string') {
                url = row.url;
            }

            return new Bukigi(
                guild_id,
                user_id,
                name,
                url,
            );
        });

        return response;
    } catch (err) {
        console.log(err);
        return [];
    }
};
