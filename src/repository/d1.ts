import { D1Database } from '@cloudflare/workers-types';
import { Bukigi } from '../models/bukigi';

export const registerBukigi: (db: D1Database, bukigi: Bukigi) => Promise<number> = async (db, bukigi) => {
    try {
        const result = await db
            .prepare(
                'INSERT INTO bukigis(guild_id, user_id, name, url) VALUES(?, ?, ?, ?)',
            )
            .bind(bukigi.guild_id, bukigi.user_id, bukigi.name, bukigi.url)
            .run();
        return result.meta.rows_written;
    } catch (err) {
        console.log(err);
        return 0;
    }
};

export const updateBukigi: (db: D1Database, oldBukigi: Bukigi, newBukigi: Bukigi) => Promise<number> = async (db, oldBukigi, newBukigi) => {
    try {
        const result = await db
            .prepare(
                'UPDATE bukigis SET name =?, url =? WHERE guild_id =? AND user_id =? AND name =?',
            )
            .bind(newBukigi.name, newBukigi.url, oldBukigi.guild_id, oldBukigi.user_id, oldBukigi.name)
            .run();
        return result.meta.changes;
    } catch (err) {
        console.log(err);
        return 0;
    }
}

export const getBukigi: (db: D1Database, guild_id: number, user_id: number, bukigi_name: string) => Promise<Bukigi | null> = async (db, guild_id, user_id, bukigi_name) => {
    try {
        const { results } = await db
            .prepare(
                'SELECT * FROM bukigis WHERE guild_id = ? AND user_id = ? AND name = ? LIMIT 1',
            )
            .bind(guild_id, user_id, bukigi_name)
            .all();

        if (results.length != 1) {
            console.log('Bukigi not found')
            return null;
        }

        const row = results[0];

        let url = '';
        if (typeof row.url === 'string') {
            url = row.url;
        }

        return new Bukigi(
            guild_id,
            user_id,
            bukigi_name,
            url,
        );
    } catch (err) {
        console.log(err);
        return null;
    }
};

export const listUserBukigi: (db: D1Database, guild_id: number, user_id: number) => Promise<Array<Bukigi>> = async (db, guild_id, user_id) => {
    try {
        const { results } = await db
            .prepare(
                'SELECT * FROM bukigis WHERE guild_id = ? AND user_id = ?',
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

export const deleteBukigi: (db: D1Database, bukigi: Bukigi) => Promise<boolean> = async (db, bukigi) => {
    try {
        const result = await db
            .prepare(
                'DELETE FROM bukigis WHERE guild_id =? AND user_id =? AND name =?',
            )
            .bind(bukigi.guild_id, bukigi.user_id, bukigi.name)
            .run();

        return result.meta.changes > 0;
    } catch (err) {
        console.log(err);
        return false;
    }
};