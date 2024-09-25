DROP TABLE IF EXISTS bukigis;
CREATE TABLE IF NOT EXISTS bukigis (
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    UNIQUE(guild_id, user_id, name)
);

CREATE INDEX guild_user_index ON bukigis(guild_id, user_id);